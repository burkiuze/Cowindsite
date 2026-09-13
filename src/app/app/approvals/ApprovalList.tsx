"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Panel, Pill, relativeTime, type Tone } from "@/components/ui/primitives";
import type { Approval } from "@/lib/workspace/types";

const RISK_TONE: Record<Approval["risk"], Tone> = { low: "neutral", medium: "warning", high: "danger" };
const STATUS_TONE: Record<Approval["status"], Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "neutral",
  expired: "neutral",
  executed: "success",
  failed: "danger",
};

/**
 * The approvals inbox.
 *
 * The approver sees the exact content that would go out, can edit it before
 * approving, and gets a receipt afterwards that says what actually happened —
 * including "nothing was sent, because that system is not connected".
 */
export function ApprovalList({ approvals, canDecide }: { approvals: Approval[]; canDecide: boolean }) {
  const pending = approvals.filter((approval) => approval.status === "pending");
  const decided = approvals.filter((approval) => approval.status !== "pending");

  return (
    <div className="mt-7 space-y-8">
      <section>
        <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-[var(--color-ink-muted)] uppercase">
          Waiting — {pending.length}
        </h2>
        {pending.length === 0 ? (
          <Panel className="py-10 text-center">
            <p className="text-[13.5px] text-[var(--color-ink)]">Nothing is waiting on you.</p>
            <p className="mt-1 text-[12.5px] text-[var(--color-ink-faint)]">
              Wind will hold anything that sends, publishes, changes or deletes until someone decides.
            </p>
          </Panel>
        ) : (
          <ul className="space-y-3">
            {pending.map((approval) => (
              <li key={approval.id}>
                <ApprovalCard approval={approval} canDecide={canDecide} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 ? (
        <section>
          <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-[var(--color-ink-muted)] uppercase">
            Decided
          </h2>
          <ul className="space-y-2.5">
            {decided.map((approval) => (
              <li key={approval.id}>
                <Panel className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[var(--color-ink)]">{approval.title}</p>
                      <p className="mt-1 text-[12.5px] text-[var(--color-ink-faint)]">
                        {approval.decisionNote ?? approval.summary}
                      </p>
                      {approval.receipt ? (
                        <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
                          <Icon name="check" size={13} className="mt-0.5 shrink-0 text-[#8ee6a4]" />
                          {approval.receipt}
                        </p>
                      ) : null}
                    </div>
                    <Pill tone={STATUS_TONE[approval.status]}>{approval.status}</Pill>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ApprovalCard({ approval, canDecide }: { approval: Approval; canDecide: boolean }) {
  const router = useRouter();
  const [payload, setPayload] = useState(approval.payload);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function decide(decision: "approved" | "rejected") {
    setError(null);
    const response = await fetch(`/api/approvals/${approval.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note: note || undefined, payload: editing ? payload : undefined }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "That decision could not be recorded." }));
      setError(body.error ?? "That decision could not be recorded.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <Panel padded={false}>
      <div className="flex items-start gap-3.5 px-5 py-4">
        <Icon name="shield" size={17} className="mt-0.5 shrink-0 text-[var(--color-stream-amber)]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-medium text-[var(--color-ink)]">{approval.title}</h3>
            <Pill tone={RISK_TONE[approval.risk]}>{approval.risk} risk</Pill>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{approval.summary}</p>
          <p className="mt-1.5 text-[11.5px] text-[var(--color-ink-faint)]">
            Prepared by {approval.requestedByAgent ?? "Wind"} · {relativeTime(approval.createdAt)}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--color-hairline)] px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11.5px] font-semibold tracking-[0.06em] text-[var(--color-ink-faint)] uppercase">
            Exactly what will happen
          </span>
          {canDecide ? (
            <button
              type="button"
              onClick={() => setEditing((current) => !current)}
              className="focus-ring rounded-md px-2 py-1 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              {editing ? "Done editing" : "Edit before approving"}
            </button>
          ) : null}
        </div>

        {editing ? (
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            rows={Math.min(16, payload.split("\n").length + 2)}
            className="w-full rounded-lg border border-[#2b3d4a] bg-[var(--color-surface)] p-3 font-mono text-[12px] leading-relaxed text-[var(--color-ink)] focus:outline-none"
          />
        ) : (
          <pre className="overflow-x-auto rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-[var(--color-ink-muted)]">
            {payload}
          </pre>
        )}
      </div>

      {canDecide ? (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--color-hairline)] px-5 py-3.5">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note (optional)"
            className="min-w-[180px] flex-1 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[#2b3d4a] focus:outline-none"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => void decide("rejected")}
            className="focus-ring rounded-lg border border-[var(--color-hairline)] px-3.5 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#4d1f27] hover:text-[#ff9aa8] disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void decide("approved")}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#6fdc8c] to-[#3fbf6a] px-3.5 py-2 text-[13px] font-medium text-[#04140a] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="check" size={14} strokeWidth={2.2} />
            Approve
          </button>
        </div>
      ) : (
        <div className="border-t border-[var(--color-hairline)] px-5 py-3 text-[12.5px] text-[var(--color-ink-faint)]">
          Your role can see this decision but not make it.
        </div>
      )}

      {error ? (
        <p className="border-t border-[#4d1f27] bg-[#1c0f12] px-5 py-2.5 text-[12.5px] text-[#ffb3bd]">{error}</p>
      ) : null}
    </Panel>
  );
}
