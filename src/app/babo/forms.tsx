"use client";

import { useActionState, useState, useTransition } from "react";
import { checkModelsAction, createPromoAction, loginAction, type FormState, type ModelCheck } from "./actions";

const input = "w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)] px-3 py-2 text-[13.5px] outline-none focus:border-[var(--color-stream-cyan)]";
const button = "rounded-lg bg-[var(--color-porcelain)] px-4 py-2 text-[13.5px] font-medium text-[var(--color-on-light)] hover:opacity-90 disabled:opacity-60";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, null);
  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input name="password" type="password" required autoFocus autoComplete="current-password" placeholder="Password" className={input} />
      <button className={button} disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
      {state?.error ? <p className="text-[13px] text-[var(--color-stream-pink)]">{state.error}</p> : null}
    </form>
  );
}

export function PromoForm({ plans }: { plans: Array<{ id: string; name: string }> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createPromoAction, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <label className="text-[12.5px] text-[var(--color-ink-muted)]">
        Plan
        <select name="plan" required defaultValue="pro" className={`${input} mt-1`}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-[12.5px] text-[var(--color-ink-muted)]">
        Membership length (days)
        <input name="days" type="number" min={1} defaultValue={30} placeholder="empty = no end" className={`${input} mt-1`} />
      </label>
      <label className="text-[12.5px] text-[var(--color-ink-muted)]">
        Max uses per code
        <input name="maxUses" type="number" min={1} defaultValue={1} placeholder="empty = unlimited" className={`${input} mt-1`} />
      </label>
      <label className="text-[12.5px] text-[var(--color-ink-muted)]">
        Code (empty = random)
        <input name="code" placeholder="e.g. LAUNCH50" autoComplete="off" className={`${input} mt-1 font-mono uppercase`} />
      </label>
      <label className="text-[12.5px] text-[var(--color-ink-muted)]">
        How many codes
        <input name="count" type="number" min={1} max={200} defaultValue={1} className={`${input} mt-1`} />
      </label>
      <label className="text-[12.5px] text-[var(--color-ink-muted)]">
        Redeemable until (optional)
        <input name="expires" type="date" className={`${input} mt-1`} />
      </label>
      <label className="text-[12.5px] text-[var(--color-ink-muted)] sm:col-span-2">
        Note (optional)
        <input name="note" placeholder="who it is for" className={`${input} mt-1`} />
      </label>
      <div className="flex items-end">
        <button className={`${button} w-full`} disabled={pending}>
          {pending ? "Creating…" : "Create"}
        </button>
      </div>
      {state?.error ? <p className="text-[13px] text-[var(--color-stream-pink)] sm:col-span-3">{state.error}</p> : null}
      {state?.ok ? (
        <div className="sm:col-span-3">
          <p className="text-[13px] text-[var(--color-stream-lime)]">{state.ok}</p>
          {state.codes?.length ? (
            <textarea readOnly value={state.codes.join("\n")} rows={Math.min(8, state.codes.length)} className={`${input} mt-2 font-mono`} onFocus={(e) => e.currentTarget.select()} />
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

export function ModelChecker() {
  const [results, setResults] = useState<ModelCheck[] | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <button className={button} disabled={pending} onClick={() => start(async () => setResults(await checkModelsAction()))}>
        {pending ? "Checking…" : "Check models on OpenRouter"}
      </button>
      {results ? (
        <ul className="mt-4 space-y-3">
          {results.map((r) => (
            <li key={r.id} className="rounded-lg border border-[var(--color-hairline)] px-4 py-3 text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{r.name}</span>
                <span className="font-mono text-[12px] text-[var(--color-ink-faint)]">
                  {r.upstream} @ {r.provider}
                </span>
                <span className={`ml-auto ${r.found && r.providerFound ? "text-[var(--color-stream-lime)]" : "text-[var(--color-stream-pink)]"}`}>
                  {r.error ? r.error : !r.found ? "model not found" : r.providerFound ? "OK" : "provider not serving this model"}
                </span>
              </div>
              {r.providers.length ? (
                <p className="mt-1.5 text-[12px] text-[var(--color-ink-muted)]">
                  Providers: {r.providers.map((p) => `${p.name} (${p.tag || "?"}${p.context ? `, ${Math.round(p.context / 1000)}k` : ""})`).join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
