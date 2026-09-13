import { isConfigured, usingDirectPool } from "@/lib/wind/adapters/endpoints";
import { primaryComplete } from "@/lib/wind/adapters/primary";
import { classifyError } from "@/lib/wind/redaction";
import { ok, rateLimit, tooMany } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

/**
 * Public health. Deliberately says nothing about who serves Navio's engines —
 * only whether Navio is able to run them.
 *
 * `?probe=1` goes one step further and actually calls an engine with a
 * throwaway prompt, because "a credential is present" and "a request succeeds"
 * are different facts, and only the second one is the one that matters when
 * the site stops answering. It reports which shape of configuration is in use
 * (a pool credential or a single direct one) and a generic failure code —
 * never a vendor, an endpoint, a model identifier or an upstream message. The
 * real detail goes to the server log, where only an operator can read it.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = {
    status: "ok",
    product: "Navio",
    assistant: "Navio",
    windReady: isConfigured(),
    mode: usingDirectPool() ? "direct" : "pool",
    time: new Date().toISOString(),
  };

  if (url.searchParams.get("probe") !== "1") return ok(base);

  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
  const limit = rateLimit(`probe:${address}`, 4);
  if (!limit.allowed) return tooMany(limit.retryAfter);

  if (!isConfigured()) return ok({ ...base, probe: { ok: false, reason: "unconfigured" } });

  const startedAt = Date.now();
  try {
    const result = await primaryComplete([{ role: "user", content: "Reply with the single word: ready" }], "probe", {
      maxTokens: 8,
      temperature: 0,
    });
    return ok({ ...base, probe: { ok: true, ms: Date.now() - startedAt, chars: result.text.trim().length } });
  } catch (error) {
    return ok({ ...base, probe: { ok: false, reason: classifyError(error), ms: Date.now() - startedAt } });
  }
}
