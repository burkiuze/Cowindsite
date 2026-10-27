"use server";

import { revalidatePath } from "next/cache";
import { db, REDEEM_ERRORS } from "@/lib/kronos/db";
import { siteAccount } from "@/lib/kronos/session";
import { planById, SITE_PATH } from "@/lib/kronos/catalog";

export type RedeemState = { ok?: string; error?: string } | null;

export async function redeemAction(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const me = await siteAccount();
  if (!me) return { error: "Sign in again and retry." };
  const code = String(formData.get("code") ?? "").trim();
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(code)) return { error: REDEEM_ERRORS.invalid };
  const r = await db.redeem(me.userId, code);
  if (r.error) return { error: REDEEM_ERRORS[r.error] ?? REDEEM_ERRORS.invalid };
  revalidatePath(`${SITE_PATH}/account`);
  const plan = planById(r.plan)?.name ?? r.plan;
  return { ok: `${plan} is active${r.plan_expires_at ? ` until ${new Date(r.plan_expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}.` };
}

export async function revokeAction(formData: FormData): Promise<void> {
  const me = await siteAccount();
  if (!me) return;
  const id = String(formData.get("id") ?? "");
  if (/^[0-9a-f-]{36}$/.test(id)) await db.revokeToken(me.userId, id);
  revalidatePath(`${SITE_PATH}/account`);
}
