"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Panel, Pill, relativeTime, type Tone } from "@/components/ui/primitives";
import type { Approval, ApprovalStep } from "@/lib/workspace/types";

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
              Navio will hold anything that sends, publishes, changes or deletes until someone decides.
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
                      {/* A multi-step action keeps a receipt per step. They are
                          the proof of what ran, so they stay readable after the
                          decision rather than only while it was running. */}
                      {approval.steps && approval.steps.length > 0 ? (
                        <ul className="mt-2.5 space-y-1.5 border-l border-[var(--color-hairline)] pl-3">
                          {approval.steps.map((step) => (
                            <li key={step.id}>
                              <p className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]">
                                <Icon
                                  name={step.status === "failed" ? "close" : step.status === "completed" ? "check" : "clock"}
                                  size={12}
                                  strokeWidth={2}
                                  className={
                                    step.status === "failed"
                                      ? "shrink-0 text-[#ff9aa8]"
                                      : step.status === "completed"
                                        ? "shrink-0 text-[#8ee6a4]"
                                        : "shrink-0 text-[var(--color-ink-faint)]"
                                  }
                                />
                                {step.label}
                              </p>
                              {step.receipt ? (
                                <p className="mt-0.5 pl-[18px] text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                  {step.receipt}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
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
  // Live state of each step while the action runs, keyed by step id.
  const [running, setRunning] = useState<Record<string, ApprovalStep["status"]>>({});
  const [receipts, setReceipts] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);

  const steps = approval.steps ?? [];

  /** Run the released steps, following the stream so progress is visible. */
  async function execute() {
    setExecuting(true);
    try {
      const response = await fetch(`/api/approvals/${approval.id}/execute`, { method: "POST" });
      if (!response.ok || !response.body) throw new Error("could not start");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffered += decoder.decode(value, { stream: true });
        const frames = buffered.split("\n\n");
        buffered = frames.pop() ?? "";

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const event = JSON.parse(line.slice(5).trim());
          if (event.type === "step") {
            setRunning((current) => ({ ...current, [event.id]: event.status }));
            if (event.receipt) setReceipts((current) => ({ ...current, [event.id]: event.receipt }));
          }
        }
      }
    } catch {
      setError("The action was approved, but running it could not be started. Nothing was left half-done.");
    } finally {
      setExecuting(false);
      startTransition(() => router.refresh());
    }
  }

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

    if (decision === "approved" && steps.length > 0) {
      await execute();
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
            Prepared by {approval.requestedByAgent ?? "Navio"} · {relativeTime(approval.createdAt)}
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

      {steps.length > 0 ? (
        <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
          {steps.map((step, index) => {
            const status = running[step.id] ?? step.status;
            const receipt = receipts[step.id] ?? step.receipt;
            return (
              <li key={step.id} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                  {status === "completed" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2417] text-[#8ee6a4]">
                      <Icon name="check" size={12} strokeWidth={2.2} />
                    </span>
                  ) : status === "running" ? (
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-[var(--color-stream-cyan)]"
                      style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }}
                    />
                  ) : status === "failed" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2c1015] text-[#ff9aa8]">
                      <Icon name="close" size={11} strokeWidth={2.2} />
                    </span>
                  ) : (
                    <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">{index + 1}</span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[var(--color-ink)]">{step.label}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-[var(--color-ink-faint)]">{step.toolId}</p>
                  {receipt ? (
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">{receipt}</p>
                  ) : null}
                </div>

                <span
                  className={`shrink-0 text-[11.5px] ${
                    status === "running"
                      ? "text-[#7fdcff]"
                      : status === "completed"
                        ? "text-[#8ee6a4]"
                        : status === "failed"
                          ? "text-[#ff9aa8]"
                          : "text-[var(--color-ink-faint)]"
                  }`}
                >
                  {status === "pending" ? "waiting" : status}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

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
            disabled={pending || executing}
            onClick={() => void decide("rejected")}
            className="focus-ring rounded-lg border border-[var(--color-hairline)] px-3.5 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#4d1f27] hover:text-[#ff9aa8] disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={pending || executing}
            onClick={() => void decide("approved")}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#6fdc8c] to-[#3fbf6a] px-3.5 py-2 text-[13px] font-medium text-[#04140a] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="check" size={14} strokeWidth={2.2} />
            {executing ? "Running…" : steps.length > 0 ? `Approve & run ${steps.length} steps` : "Approve"}
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
