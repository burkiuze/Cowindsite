import { createHash, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import { adminPasswordOk, adminSessionOk, adminSessionValue, createAuthCode, isLoopbackRedirect, validRedirect, verifyAuthCode } from "@/lib/kronos/crypto";
import { cloudModel, cloudModels, planLimits } from "@/lib/kronos/catalog";
import { accountView } from "@/lib/kronos/view";

beforeAll(() => {
  process.env.KRONOS_SIGNING_SECRET = randomBytes(32).toString("base64url");
});

const pkce = () => {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier).digest("base64url") };
};

describe("app sign-in codes", () => {
  it("trade only with the verifier, the same redirect address and before they expire", () => {
    const { verifier, challenge } = pkce();
    const code = createAuthCode("user_1", challenge, "http://127.0.0.1:7777/api/account/callback");
    expect(verifyAuthCode(code, verifier, "http://127.0.0.1:7777/api/account/callback")?.uid).toBe("user_1");
    expect(verifyAuthCode(code, pkce().verifier, "http://127.0.0.1:7777/api/account/callback")).toBeNull();
    expect(verifyAuthCode(code, verifier, "http://127.0.0.1:9999/api/account/callback")).toBeNull();
    const [payload] = code.split(".");
    const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload!, "base64url").toString()), uid: "user_2" })).toString("base64url");
    expect(verifyAuthCode(`${forged}.${code.split(".")[1]}`, verifier, "http://127.0.0.1:7777/api/account/callback")).toBeNull();
    const expired = createAuthCode("user_1", challenge, "http://127.0.0.1:7777/cb", -1);
    expect(verifyAuthCode(expired, verifier, "http://127.0.0.1:7777/cb")).toBeNull();
  });

  it("tell this computer from other hosts", () => {
    expect(isLoopbackRedirect("http://127.0.0.1:7777/x")).toBe(true);
    expect(isLoopbackRedirect("http://localhost:3000/x")).toBe(true);
    expect(isLoopbackRedirect("https://kronos.example.com/x")).toBe(false);
    expect(validRedirect("javascript:alert(1)")).toBe(false);
    expect(validRedirect("https://user:pw@example.com/")).toBe(false);
  });
});

describe("operator sign-in", () => {
  it("checks the password against the scrypt hash and signs a session that expires", () => {
    const hash = execFileSync("node", ["scripts/kronos-admin-hash.mjs"], { input: "correct horse battery" }).toString().trim();
    process.env.KRONOS_ADMIN_PASSWORD_HASH = hash;
    expect(adminPasswordOk("correct horse battery")).toBe(true);
    expect(adminPasswordOk("correct horse batterY")).toBe(false);
    const s = adminSessionValue();
    expect(adminSessionOk(s.value)).toBe(true);
    expect(adminSessionOk(`${s.value}x`)).toBe(false);
    expect(adminSessionOk(`1.${s.value.split(".")[1]}`)).toBe(false);
  });
});

describe("plans and models", () => {
  it("scales usage from Pro: Max is 2×, Max 5 is 5×", () => {
    const pro = planLimits("pro");
    expect(planLimits("max").weekMicro).toBe(pro.weekMicro * 2);
    expect(planLimits("max5").fiveHourMicro).toBe(pro.fiveHourMicro * 5);
    expect(planLimits("lite").weekMicro).toBeLessThan(pro.weekMicro);
  });

  it("serves the four models pinned to their providers, and takes corrections from the environment", () => {
    expect(cloudModels().map((m) => m.provider)).toEqual(["open-inference", "nebius", "crusoe", "wafer"]);
    expect(cloudModel("kronos:glm-5.3-flash")?.upstream).toBe("z-ai/glm-5.3-flash");
    process.env.KRONOS_MODEL_OVERRIDES = JSON.stringify({ "glm-5.3-flash": { provider: "openinference" } });
    expect(cloudModel("glm-5.3-flash")?.provider).toBe("openinference");
    delete process.env.KRONOS_MODEL_OVERRIDES;
  });

  it("reports usage against the plan with reset times", () => {
    const start = new Date(Date.now() - 3_600_000).toISOString();
    const v = accountView({ user_id: "u", email: "a@b.c", plan: "pro", plan_expires_at: null, usage: { "5h": { start, spent_micro: planLimits("pro").fiveHourMicro / 2 }, week: null } });
    expect(v.plan?.name).toBe("Pro");
    expect(v.usage.fiveHour.percent).toBe(50);
    expect(new Date(v.usage.fiveHour.resetsAt!).getTime() - new Date(start).getTime()).toBe(5 * 3_600_000);
    expect(v.usage.week.resetsAt).toBeNull();
  });
});
