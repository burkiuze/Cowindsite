"use client";

import { useActionState } from "react";
import { redeemAction, type RedeemState } from "./actions";

export function RedeemForm() {
  const [state, action, pending] = useActionState<RedeemState, FormData>(redeemAction, null);
  return (
    <form action={action} className="mt-3">
      <div className="flex gap-2">
        <input
          name="code"
          required
          placeholder="PROMO-CODE"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)] px-3 py-2 font-mono text-[13.5px] uppercase outline-none focus:border-[var(--color-stream-cyan)]"
        />
        <button type="submit" disabled={pending} className="kx-btn blue disabled:opacity-60">
          {pending ? "Redeeming…" : "Redeem"}
        </button>
      </div>
      {state?.error ? <p className="mt-2 text-[13px] text-[var(--color-stream-pink)]">{state.error}</p> : null}
      {state?.ok ? <p className="mt-2 text-[13px] text-[var(--color-stream-lime)]">{state.ok}</p> : null}
    </form>
  );
}
