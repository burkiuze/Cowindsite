import { cloudModels, planById, planLimits, PLANS, type PlanId } from "./catalog";
import type { Account, UsageWindow } from "./db";

/** What the app and the account page show about an account: plan, limits, usage, and when each window resets. */
export function accountView(a: Account) {
  const plan = a.plan ? planById(a.plan) : undefined;
  const limits = a.plan ? planLimits(a.plan as PlanId) : { fiveHourMicro: 0, weekMicro: 0 };
  const win = (w: UsageWindow | null, hours: number, limit: number) => {
    const spent = w?.spent_micro ?? 0;
    return {
      spentMicro: spent,
      limitMicro: limit,
      percent: limit > 0 ? Math.min(100, Math.round((spent / limit) * 1000) / 10) : 0,
      resetsAt: w ? new Date(new Date(w.start).getTime() + hours * 3_600_000).toISOString() : null,
    };
  };
  return {
    email: a.email,
    plan: plan ? { id: plan.id, name: plan.name } : null,
    planExpiresAt: a.plan_expires_at,
    usage: { fiveHour: win(a.usage?.["5h"] ?? null, 5, limits.fiveHourMicro), week: win(a.usage?.week ?? null, 168, limits.weekMicro) },
  };
}

export function modelsView() {
  return cloudModels().map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    contextWindow: m.contextWindow,
    maxOutput: m.maxOutput,
    vision: m.vision,
    description: m.blurb,
  }));
}

export function plansView() {
  return PLANS.map((p) => ({ id: p.id, name: p.name, multiplier: p.multiplier, description: p.blurb }));
}

export function jsonError(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return Response.json({ error: { code, message, ...extra } }, { status, headers: { "Cache-Control": "no-store" } });
}
