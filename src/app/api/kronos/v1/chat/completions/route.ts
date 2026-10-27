import { cloudModel, planLimits, type CloudModel, type PlanId } from "@/lib/kronos/catalog";
import { db, DbError, type Account } from "@/lib/kronos/db";
import { bearerAccount } from "@/lib/kronos/session";
import { jsonError } from "@/lib/kronos/view";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

/** Client fields that could route a request to another model or provider than the one paid for. */
const STRIPPED = ["models", "route", "provider", "plugins", "transforms", "user", "preset"];

interface Usage {
  prompt_tokens?: number;
  completion_tokens?: number;
  cost?: number;
}

function costMicro(model: CloudModel, usage: Usage | undefined, fallback: { input: number; output: number }): { input: number; output: number; micro: number } {
  const input = usage?.prompt_tokens ?? fallback.input;
  const output = usage?.completion_tokens ?? fallback.output;
  const micro =
    typeof usage?.cost === "number" && Number.isFinite(usage.cost)
      ? Math.round(usage.cost * 1_000_000)
      : Math.round(input * model.price.input + output * model.price.output);
  return { input, output, micro };
}

function overLimit(account: Account): { window: "5-hour" | "weekly"; resetsAt: string } | null {
  const limits = planLimits(account.plan as PlanId);
  const five = account.usage?.["5h"];
  if (five && five.spent_micro >= limits.fiveHourMicro) return { window: "5-hour", resetsAt: new Date(new Date(five.start).getTime() + 5 * 3_600_000).toISOString() };
  const week = account.usage?.week;
  if (week && week.spent_micro >= limits.weekMicro) return { window: "weekly", resetsAt: new Date(new Date(week.start).getTime() + 7 * 86_400_000).toISOString() };
  return null;
}

async function record(account: Account, model: CloudModel, usage: Usage | undefined, fallback: { input: number; output: number }) {
  const c = costMicro(model, usage, fallback);
  try {
    await db.recordUsage(account.user_id, model.id, c.input, c.output, c.micro);
  } catch (e) {
    console.error("kronos usage not recorded", e);
  }
}

/**
 * OpenAI-compatible chat completions for Kronos Cloud members.
 *
 * The request goes to OpenRouter pinned to the model's provider (no fallbacks
 * to other providers or models), its upstream cost is added to the member's
 * 5-hour and weekly windows, and a member over either budget is told when it
 * resets instead of being served.
 */
export async function POST(request: Request) {
  let account: Account | null;
  try {
    account = await bearerAccount(request);
  } catch (e) {
    return jsonError(503, "unavailable", e instanceof DbError ? e.message : "Kronos Cloud is unavailable.");
  }
  if (!account) return jsonError(401, "unauthorized", "Sign in to Kronos to use Kronos Cloud models.");
  if (!account.plan) return jsonError(402, "membership_required", "Kronos Cloud models need a membership (Lite, Pro, Max or Max 5). Choose a plan or redeem a promo code in Settings → Membership.");
  const limited = overLimit(account);
  if (limited) {
    return jsonError(429, "usage_limit", `You have used your ${limited.window} Kronos Cloud allowance. It resets at ${limited.resetsAt}.`, { resets_at: limited.resetsAt });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, "bad_request", "Expected a JSON body.");
  }
  const model = cloudModel(String(body.model ?? ""));
  if (!model) return jsonError(404, "model_not_found", `Kronos Cloud does not serve "${String(body.model ?? "")}".`);
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return jsonError(503, "unavailable", "Kronos Cloud is not available right now.");

  for (const k of STRIPPED) delete body[k];
  const stream = body.stream === true;
  for (const k of ["max_tokens", "max_completion_tokens"]) {
    if (typeof body[k] === "number") body[k] = Math.min(body[k] as number, model.maxOutput);
  }
  const upstreamBody = {
    ...body,
    model: model.upstream,
    provider: { order: [model.provider], allow_fallbacks: false },
    usage: { include: true },
    ...(stream ? { stream_options: { include_usage: true } } : {}),
  };
  const inputEstimate = Math.ceil(JSON.stringify(body.messages ?? "").length / 4);

  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://heynavio.com/kronosagent",
        "X-Title": "Kronos Agent",
      },
      body: JSON.stringify(upstreamBody),
      signal: request.signal,
    });
  } catch {
    return jsonError(502, "upstream_unreachable", `${model.name} could not be reached. Try again in a moment.`);
  }

  if (!upstream.ok) {
    const detail = (await upstream.json().catch(() => null)) as { error?: { message?: string } } | null;
    console.error(`kronos upstream ${model.upstream}@${model.provider}: ${upstream.status} ${detail?.error?.message ?? ""}`);
    const status = upstream.status === 429 ? 429 : upstream.status >= 500 ? 502 : upstream.status === 400 ? 400 : 502;
    const message =
      upstream.status === 400 ? detail?.error?.message || "The request was rejected." : upstream.status === 429 ? `${model.name} is busy. Try again in a moment.` : `${model.name} is temporarily unavailable.`;
    return jsonError(status, "upstream_error", message);
  }

  if (!stream) {
    const json = (await upstream.json()) as Record<string, unknown> & { usage?: Usage };
    const outChars = JSON.stringify(json.choices ?? "").length;
    await record(account, model, json.usage, { input: inputEstimate, output: Math.ceil(outChars / 4) });
    json.model = model.id;
    if (json.usage) delete json.usage.cost;
    return Response.json(json, { headers: { "Cache-Control": "no-store" } });
  }

  // stream through unchanged, watching for the usage chunk; a dropped connection is billed by estimate
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const acct = account;
  let usage: Usage | undefined;
  let outChars = 0;
  let pending = "";
  let recorded = false;
  const finish = async () => {
    if (recorded) return;
    recorded = true;
    await record(acct, model, usage, { input: inputEstimate, output: Math.ceil(outChars / 4) });
  };
  const rewrite = (line: string): string => {
    if (!line.startsWith("data:") || line.includes("[DONE]")) return line;
    try {
      const chunk = JSON.parse(line.slice(5)) as Record<string, unknown> & { usage?: Usage; choices?: Array<{ delta?: { content?: string; reasoning?: string } }> };
      if (chunk.usage) usage = { ...chunk.usage };
      for (const c of chunk.choices ?? []) outChars += (c.delta?.content?.length ?? 0) + (c.delta?.reasoning?.length ?? 0);
      chunk.model = model.id;
      if (chunk.usage) delete chunk.usage.cost;
      return `data: ${JSON.stringify(chunk)}`;
    } catch {
      return line;
    }
  };
  const out = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          if (pending) controller.enqueue(encoder.encode(rewrite(pending)));
          await finish();
          controller.close();
          return;
        }
        pending += decoder.decode(value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        if (lines.length) controller.enqueue(encoder.encode(lines.map(rewrite).join("\n") + "\n"));
      } catch (e) {
        await finish();
        controller.error(e);
      }
    },
    async cancel() {
      await reader.cancel().catch(() => undefined);
      await finish();
    },
  });
  return new Response(out, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
