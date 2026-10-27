"use server";

import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/kronos/db";
import { ADMIN_COOKIE, adminPasswordOk, adminSessionOk, adminSessionValue } from "@/lib/kronos/crypto";
import { cloudModels, PLAN_IDS, type PlanId } from "@/lib/kronos/catalog";

/** Failed logins per client address, per server instance: enough to make guessing slow. */
const failures = new Map<string, { count: number; until: number }>();

async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  if (!adminSessionOk(jar.get(ADMIN_COOKIE)?.value)) throw new Error("Not signed in.");
}

export type FormState = { ok?: string; error?: string; codes?: string[] } | null;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  const f = failures.get(ip);
  if (f && f.until > Date.now()) return { error: "Too many attempts. Wait a few minutes and try again." };
  const password = String(formData.get("password") ?? "");
  if (!adminPasswordOk(password)) {
    const count = (f?.count ?? 0) + 1;
    failures.set(ip, { count, until: count >= 5 ? Date.now() + 10 * 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong password." };
  }
  failures.delete(ip);
  const s = adminSessionValue();
  (await cookies()).set(ADMIN_COOKIE, s.value, { httpOnly: true, secure: true, sameSite: "strict", path: "/babo", maxAge: s.maxAge });
  revalidatePath("/babo");
  return { ok: "Signed in." };
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/babo" });
  revalidatePath("/babo");
}

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  return `KRONOS-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

export async function createPromoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const plan = String(formData.get("plan") ?? "") as PlanId;
  if (!PLAN_IDS.includes(plan)) return { error: "Choose a plan." };
  const days = String(formData.get("days") ?? "").trim();
  const maxUses = String(formData.get("maxUses") ?? "").trim();
  const expires = String(formData.get("expires") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  const count = Math.min(Math.max(Number(formData.get("count") || 1), 1), 200);
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (code && !/^[A-Z0-9_-]{3,64}$/.test(code)) return { error: "A code may use letters, digits, - and _ (3–64 characters)." };
  if (code && count > 1) return { error: "Leave the code empty to generate several codes." };
  const durationDays = days ? Math.round(Number(days)) : null;
  if (durationDays !== null && (!Number.isFinite(durationDays) || durationDays < 1)) return { error: "Days must be 1 or more (or empty for no end date)." };
  const uses = maxUses ? Math.round(Number(maxUses)) : null;
  if (uses !== null && (!Number.isFinite(uses) || uses < 1)) return { error: "Max uses must be 1 or more (or empty for unlimited)." };
  const expiresAt = expires ? new Date(`${expires}T23:59:59Z`).toISOString() : null;

  const created: string[] = [];
  for (let attempt = 0; created.length < count && attempt < count * 3; attempt++) {
    const c = code || randomCode();
    const r = await db.admin.createPromo({ code: c, plan, durationDays, maxUses: uses, expiresAt, note });
    if (r.error === "exists") {
      if (code) return { error: `${c} already exists.` };
      continue; // a generated code collided: draw another
    }
    created.push(c);
  }
  revalidatePath("/babo");
  return { ok: `Created ${created.length} code${created.length === 1 ? "" : "s"}.`, codes: created };
}

export async function togglePromoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.admin.setPromoActive(String(formData.get("code") ?? ""), formData.get("active") === "1");
  revalidatePath("/babo");
}

export async function setPlanAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const plan = String(formData.get("plan") ?? "");
  const days = Number(formData.get("days") || 0);
  const expiresAt = days > 0 ? new Date(Date.now() + days * 86_400_000).toISOString() : null;
  await db.admin.setPlan(userId, PLAN_IDS.includes(plan as PlanId) ? (plan as PlanId) : null, expiresAt);
  revalidatePath("/babo");
}

export interface ModelCheck {
  id: string;
  name: string;
  upstream: string;
  provider: string;
  found: boolean;
  providerFound: boolean;
  providers: Array<{ name: string; tag: string; context: number | null; status: string }>;
  error?: string;
}

/** Asks OpenRouter which providers serve each model, so a wrong slug shows up here rather than as failed requests. */
export async function checkModelsAction(): Promise<ModelCheck[]> {
  await requireAdmin();
  const key = process.env.OPENROUTER_API_KEY;
  return Promise.all(
    cloudModels().map(async (m): Promise<ModelCheck> => {
      const base = { id: m.id, name: m.name, upstream: m.upstream, provider: m.provider, found: false, providerFound: false, providers: [] };
      try {
        const res = await fetch(`https://openrouter.ai/api/v1/models/${m.upstream}/endpoints`, {
          headers: key ? { Authorization: `Bearer ${key}` } : {},
          cache: "no-store",
        });
        if (!res.ok) return { ...base, error: `OpenRouter answered ${res.status}` };
        const json = (await res.json()) as { data?: { endpoints?: Array<{ provider_name?: string; tag?: string; context_length?: number; status?: number | string }> } };
        const providers = (json.data?.endpoints ?? []).map((e) => ({
          name: e.provider_name ?? "?",
          tag: e.tag ?? "",
          context: e.context_length ?? null,
          status: String(e.status ?? ""),
        }));
        const slug = m.provider.toLowerCase();
        const providerFound = providers.some(
          (p) => p.tag.toLowerCase() === slug || p.tag.toLowerCase().split("/")[0] === slug || p.name.toLowerCase().replace(/\s+/g, "-") === slug,
        );
        return { ...base, found: true, providerFound, providers };
      } catch (e) {
        return { ...base, error: e instanceof Error ? e.message : "request failed" };
      }
    }),
  );
}
