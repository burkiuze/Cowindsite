import "server-only";
import type { PlanId } from "./catalog";

/**
 * The Kronos Cloud database, reached only through its gated functions
 * (supabase/migrations/20261027_kronos_cloud.sql). Each call carries the shared
 * secret, so the public key in KRONOS_SUPABASE_ANON_KEY can do nothing alone.
 */

export interface UsageWindow {
  start: string;
  spent_micro: number;
}

export interface Account {
  user_id: string;
  email: string | null;
  plan: PlanId | null;
  plan_expires_at: string | null;
  usage: { "5h": UsageWindow | null; week: UsageWindow | null };
  token_id?: string;
}

export class DbError extends Error {}

export function dbConfigured(): boolean {
  return Boolean(process.env.KRONOS_SUPABASE_URL && process.env.KRONOS_SUPABASE_ANON_KEY && process.env.KRONOS_DB_SECRET);
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.KRONOS_SUPABASE_URL;
  const key = process.env.KRONOS_SUPABASE_ANON_KEY;
  const secret = process.env.KRONOS_DB_SECRET;
  if (!url || !key || !secret) throw new DbError("Kronos Cloud storage is not configured.");
  const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: secret, ...args }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`kronos db ${fn} failed: ${res.status} ${text.slice(0, 300)}`);
    throw new DbError("Kronos Cloud storage is unavailable.");
  }
  return (await res.json()) as T;
}

export const db = {
  upsertAccount: (userId: string, email: string | null) => rpc<Account>("kronos_upsert_account", { p_user_id: userId, p_email: email }),
  account: (userId: string) => rpc<Account | null>("kronos_account", { p_user_id: userId }),
  issueToken: (userId: string, tokenHash: string, label: string) =>
    rpc<string>("kronos_issue_token", { p_user_id: userId, p_token_hash: tokenHash, p_label: label }),
  auth: (tokenHash: string) => rpc<Account | null>("kronos_auth", { p_token_hash: tokenHash }),
  listTokens: (userId: string) =>
    rpc<Array<{ id: string; label: string | null; created_at: string; last_used_at: string | null }>>("kronos_list_tokens", { p_user_id: userId }),
  revokeToken: (userId: string, tokenId: string) => rpc<boolean>("kronos_revoke_token", { p_user_id: userId, p_token_id: tokenId }),
  recordUsage: (userId: string, model: string, input: number, output: number, costMicro: number) =>
    rpc<Account>("kronos_record_usage", { p_user_id: userId, p_model: model, p_input: input, p_output: output, p_cost_micro: costMicro }),
  redeem: (userId: string, code: string) =>
    rpc<{ ok?: true; error?: string; plan?: PlanId; plan_expires_at?: string | null; account?: Account }>("kronos_redeem", {
      p_user_id: userId,
      p_code: code,
    }),
  admin: {
    createPromo: (p: { code: string; plan: PlanId; durationDays: number | null; maxUses: number | null; expiresAt: string | null; note: string | null }) =>
      rpc<Record<string, unknown> & { error?: string }>("kronos_admin_create_promo", {
        p_code: p.code,
        p_plan: p.plan,
        p_duration_days: p.durationDays,
        p_max_uses: p.maxUses,
        p_expires_at: p.expiresAt,
        p_note: p.note,
      }),
    listPromos: () => rpc<PromoCode[]>("kronos_admin_list_promos", {}),
    setPromoActive: (code: string, active: boolean) => rpc<boolean>("kronos_admin_set_promo_active", { p_code: code, p_active: active }),
    listAccounts: (query: string | null, limit: number, offset: number) =>
      rpc<{ total: number; rows: Array<Account & { created_at: string; spent_30d_micro: number }> }>("kronos_admin_list_accounts", {
        p_query: query,
        p_limit: limit,
        p_offset: offset,
      }),
    setPlan: (userId: string, plan: PlanId | null, expiresAt: string | null) =>
      rpc<Account>("kronos_admin_set_plan", { p_user_id: userId, p_plan: plan, p_expires_at: expiresAt }),
    stats: () =>
      rpc<{
        accounts: number;
        members: Record<string, number> | null;
        spent_7d_micro: number;
        requests_7d: number;
        by_model_7d: Record<string, { requests: number; cost_micro: number }> | null;
      }>("kronos_admin_stats", {}),
  },
};

export interface PromoCode {
  code: string;
  plan: PlanId;
  duration_days: number | null;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  note: string | null;
  active: boolean;
  created_at: string;
}

export const REDEEM_ERRORS: Record<string, string> = {
  invalid: "This code is not valid.",
  expired: "This code has expired.",
  used_up: "This code has been used the maximum number of times.",
  already_redeemed: "You have already used this code.",
  no_account: "Sign in again and retry.",
};
