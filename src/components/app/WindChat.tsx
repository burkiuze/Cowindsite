"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NavioMark } from "@/components/brand/NavioMark";
import { Icon } from "@/components/ui/Icon";
import { Markdown } from "@/components/app/Markdown";
import { ExecutionTrace, type TraceLane } from "@/components/app/ExecutionTrace";
import { ActionCards, type RunAction } from "@/components/app/ActionCards";
import { FinanceReport } from "@/components/app/FinanceReport";
import { SparkRunCard } from "@/components/app/SparkRunCard";
import type { FinanceReportView } from "@/lib/workspace/report-view";
import { Pill } from "@/components/ui/primitives";

type ChatAttachment = {
  id: string;
  name: string;
  kind: "image" | "document" | "spreadsheet" | "code" | "data" | "other";
  mimeType: string;
  size: number;
  dataUrl?: string;
  text?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: Array<{ id: string; name: string; kind: string; size: number }>;
  trace?: TraceLane[];
  actions?: RunAction[];
  report?: FinanceReportView;
  sparkRunId?: string;
  approvalId?: string;
  taskId?: string;
};

type Props = {
  conversationId?: string;
  initialMessages: ChatMessage[];
  userInitials: string;
  windReady: boolean;
  suggestions: Array<{ title: string; prompt: string; hint: string }>;
};

const MAX_ATTACHMENTS = 6;

type Mode = "normal" | "spark";
const MODE_KEY = "navio:chat-mode";
const MODES: Array<{ id: Mode; label: string; icon: "send" | "sparkle" }> = [
  { id: "normal", label: "Normal", icon: "send" },
  { id: "spark", label: "Spark", icon: "sparkle" },
];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * The Navio surface.
 *
 * One conversation, one assistant. While a request runs, the execution trace
 * shows which streams are open and what state each is in; the answer streams in
 * underneath. Anything consequential surfaces as an approval card rather than
 * being claimed as done.
 */
export function WindChat({ conversationId, initialMessages, userInitials, windReady, suggestions }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [lanes, setLanes] = useState<TraceLane[]>([]);
  const [actions, setActions] = useState<RunAction[]>([]);
  const [report, setReport] = useState<FinanceReportView | null>(null);
  const [mode, setMode] = useState<Mode>("normal");
  const [starting, setStarting] = useState(false);

  // The mode is a per-person preference, not state anyone else needs: keep it
  // in this browser, and never let a blocked storage stop the chat working.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODE_KEY);
      if (saved === "spark" || saved === "normal") setMode(saved);
    } catch {
      // Storage unavailable: normal mode it is.
    }
  }, []);

  function chooseMode(next: Mode) {
    setMode(next);
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      // Not remembered, still applied.
    }
  }
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<{ level: "info" | "warn"; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approval, setApproval] = useState<{ id: string; title: string; summary: string } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const activeConversation = useRef<string | undefined>(conversationId);

  const scrollToEnd = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, draft, lanes.length, actions.length, scrollToEnd]);

  // Reset only when the conversation itself changes. A re-render of the same
  // route hands us a fresh array instance, and resetting on that would wipe an
  // answer that just streamed in — which is exactly what it used to do.
  const loadedConversation = useRef<string | undefined>(conversationId);
  useEffect(() => {
    if (loadedConversation.current === conversationId) return;
    loadedConversation.current = conversationId;
    activeConversation.current = conversationId;
    setMessages(initialMessages);
    setLanes([]);
    setActions([]);
    setReport(null);
    setDraft("");
    setApproval(null);
    setError(null);
  }, [conversationId, initialMessages]);

  const canSend = useMemo(
    () =>
      windReady &&
      !streaming &&
      !starting &&
      (mode === "spark" ? input.trim().length > 0 : input.trim().length > 0 || attachments.length > 0),
    [windReady, streaming, starting, mode, input, attachments.length],
  );

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming: ChatAttachment[] = [];

    for (const file of Array.from(fileList).slice(0, MAX_ATTACHMENTS - attachments.length)) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is larger than Navio accepts in one go (10 MB).`);
        continue;
      }
      const kind = kindOf(file);
      const base: ChatAttachment = {
        id: `att_${Math.random().toString(36).slice(2, 10)}`,
        name: file.name,
        kind,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      };

      if (kind === "image") base.dataUrl = await readAsDataUrl(file);
      else base.text = (await readAsText(file)).slice(0, 200_000);

      incoming.push(base);
    }

    setAttachments((current) => [...current, ...incoming].slice(0, MAX_ATTACHMENTS));
  }

  async function send(promptOverride?: string) {
    if (mode === "spark") return spark(promptOverride);
    const message = (promptOverride ?? input).trim();
    if (!message && attachments.length === 0) return;
    if (streaming) return;

    setError(null);
    setNotice(null);
    setApproval(null);
    setLanes([]);
    setActions([]);
    setDraft("");
    setInput("");
    const sentAttachments = attachments;
    setAttachments([]);

    const optimistic: ChatMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      content: message,
      createdAt: Date.now(),
      attachments: sentAttachments.map(({ id, name, kind, size }) => ({ id, name, kind, size })),
    };
    setMessages((current) => [...current, optimistic]);
    setStreaming(true);
    setPhase("Navio is thinking");

    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    const runLanes = new Map<string, TraceLane>();
    const runActions: RunAction[] = [];
    let runReport: FinanceReportView | undefined;
    setReport(null);

    try {
      const response = await fetch("/api/wind/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: activeConversation.current,
          message,
          attachments: sentAttachments,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({ error: "Temporary Navio service error." }));
        throw new Error(payload.error ?? "Temporary Navio service error.");
      }

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

          switch (event.type) {
            case "status":
              setPhase(event.message);
              break;
            case "plan":
              for (const lane of event.lanes) {
                runLanes.set(lane.id, { id: lane.id, label: lane.label, actor: actorOf(lane.role), status: "waiting" });
              }
              setLanes([...runLanes.values()]);
              break;
            case "lane": {
              const existing = runLanes.get(event.id);
              runLanes.set(event.id, {
                id: event.id,
                label: event.label,
                actor: actorOf(event.role),
                status: event.status,
                note: event.note ?? existing?.note,
              });
              setLanes([...runLanes.values()]);
              break;
            }
            case "action": {
              const existing = runActions.findIndex((candidate) => candidate.id === event.id);
              const record: RunAction = {
                id: event.id,
                integrationId: event.integrationId,
                integrationName: event.integrationName,
                logo: event.logo,
                dark: event.dark,
                toolId: event.toolId,
                label: event.label,
                status: event.status,
              };
              if (existing >= 0) runActions[existing] = record;
              else runActions.push(record);
              setActions([...runActions]);
              break;
            }
            case "report":
              // A month's figures render as a report, not as a paragraph of
              // numbers; the answer text alongside it stays prose.
              setReport(event.report);
              runReport = event.report;
              break;
            case "delta":
              answer += event.text;
              setDraft(answer);
              break;
            case "notice":
              setNotice({ level: event.level, message: event.message });
              break;
            case "approval":
              setApproval({ id: event.approvalId, title: event.title, summary: event.summary });
              break;
            case "error":
              setError(event.message);
              break;
            case "done": {
              const isNew = !activeConversation.current;
              activeConversation.current = event.conversationId;
              setMessages((current) => [
                ...current,
                {
                  id: event.messageId,
                  role: "assistant",
                  content: answer,
                  createdAt: Date.now(),
                  trace: [...runLanes.values()],
                  actions: [...runActions],
                  report: runReport,
                  taskId: event.taskId,
                },
              ]);
              setDraft("");
              if (isNew) {
                // Replace rather than push: the empty /app/wind entry is not
                // worth a back step, and the route now matches the stored
                // conversation instead of being patched in by hand.
                router.replace(`/app/wind/${event.conversationId}`);
                // The sidebar lives in a shared layout that client navigation
                // does not re-render, so ask for it explicitly. Safe now that
                // the reset effect keys on the conversation id.
                router.refresh();
              }
              break;
            }
            default:
              break;
          }
        }
      }
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") {
        setError((caught as Error).message || "Temporary Navio service error. Nothing was changed — try again.");
      }
      if (answer) {
        setMessages((current) => [
          ...current,
          { id: `local_a_${Date.now()}`, role: "assistant", content: answer, createdAt: Date.now() },
        ]);
      }
      setDraft("");
    } finally {
      setStreaming(false);
      setPhase("");
      abortRef.current = null;
    }
  }

  /**
   * Hand the request to Spark.
   *
   * The server answers at once with where the run lives and keeps working after
   * the response; this only places the run in the conversation. The composer is
   * free again straight away — Spark does not hold the chat hostage.
   */
  async function spark(promptOverride?: string) {
    const message = (promptOverride ?? input).trim();
    if (!message || starting) return;

    setError(null);
    setNotice(null);
    setInput("");
    setStarting(true);

    try {
      const response = await fetch("/api/spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversation.current, message }),
      });
      const data = (await response.json()) as {
        runId?: string;
        conversationId?: string;
        userMessageId?: string;
        messageId?: string;
        taskId?: string;
        error?: string;
      };
      if (!response.ok || !data.runId || !data.conversationId || !data.messageId) {
        setError(data.error ?? "Spark could not start that run. Nothing was changed — try again.");
        setInput(message);
        return;
      }

      const isNew = !activeConversation.current;
      activeConversation.current = data.conversationId;
      setMessages((current) => [
        ...current,
        { id: data.userMessageId ?? `local_${Date.now()}`, role: "user", content: message, createdAt: Date.now() },
        {
          id: data.messageId!,
          role: "assistant",
          content: "",
          createdAt: Date.now(),
          sparkRunId: data.runId,
          taskId: data.taskId,
        },
      ]);
      if (isNew) {
        router.replace(`/app/wind/${data.conversationId}`);
        router.refresh();
      }
    } catch {
      setError("Spark could not start that run. Nothing was changed — try again.");
      setInput(message);
    } finally {
      setStarting(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
    setPhase("");
  }

  const isEmpty = messages.length === 0 && !streaming && !draft;

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-[var(--color-hairline)] px-6">
        <NavioMark size={20} state={streaming ? "thinking" : "idle"} />
        <div className="min-w-0">
          <h1 className="text-[14px] leading-none font-semibold text-[var(--color-ink)]">Navio</h1>
          <p className="mt-1 text-[11.5px] leading-none text-[var(--color-ink-faint)]">
            {streaming ? phase || "Working" : windReady ? "Ready" : "Standing by"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!windReady ? <Pill tone="warning">Engines not connected</Pill> : null}
          <Link
            href="/app/wind"
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-2.5 py-1.5 text-[12.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b323c] hover:text-[var(--color-ink)]"
          >
            <Icon name="plus" size={14} />
            New chat
          </Link>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          {isEmpty ? (
            <EmptyChat suggestions={suggestions} onPick={(prompt) => send(prompt)} disabled={!windReady} />
          ) : (
            <div className="space-y-7">
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} userInitials={userInitials} />
              ))}

              {streaming || draft ? (
                <div className="animate-rise space-y-3">
                  {lanes.length > 0 ? <ExecutionTrace lanes={lanes} phase={phase} /> : null}
                  <ActionCards actions={actions} />
                  {report ? <FinanceReport report={report} /> : null}
                  <div className="flex gap-3.5">
                    <NavioMark size={26} state="thinking" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      {draft ? (
                        <Markdown text={draft} />
                      ) : (
                        <p className="flex items-center gap-2 pt-1 text-[13.5px] text-[var(--color-ink-muted)]">
                          {phase || "Navio is thinking"}
                          <span className="inline-flex gap-1">
                            {[0, 1, 2].map((dot) => (
                              <span
                                key={dot}
                                className="h-1 w-1 rounded-full bg-[var(--color-stream-cyan)]"
                                style={{ animation: `pulse-dot 1.2s ease-in-out ${dot * 0.18}s infinite` }}
                              />
                            ))}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {notice ? (
                <div className="panel-quiet flex items-start gap-2.5 px-3.5 py-2.5 text-[12.5px] text-[var(--color-ink-muted)]">
                  <Icon
                    name={notice.level === "warn" ? "alert" : "sparkle"}
                    size={15}
                    className="mt-px text-[var(--color-stream-cyan)]"
                  />
                  {notice.message}
                </div>
              ) : null}

              {approval ? <ApprovalCard approval={approval} /> : null}

              {error ? (
                <div className="flex items-start gap-2.5 rounded-[14px] border border-[#4d1f27] bg-[#1c0f12] px-3.5 py-3 text-[13px] text-[#ffb3bd]">
                  <Icon name="alert" size={15} className="mt-px shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--color-hairline)] bg-[var(--color-void)]/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          {attachments.length > 0 ? (
            <ul className="mb-2.5 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] py-1.5 pr-1.5 pl-2.5 text-[12px] text-[var(--color-ink-muted)]"
                >
                  <Icon name="attach" size={13} />
                  <span className="max-w-[180px] truncate">{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((current) => current.filter((a) => a.id !== attachment.id))}
                    className="focus-ring rounded p-0.5 hover:text-[var(--color-ink)]"
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <Icon name="close" size={12} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="panel flex items-end gap-2 p-2 transition-colors focus-within:border-[#2b3d4a]">
            <label className="focus-ring cursor-pointer rounded-lg p-2 text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]">
              <Icon name="attach" size={17} />
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  void handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <span className="sr-only">Attach files</span>
            </label>

            <textarea
              ref={composerRef}
              value={input}
              rows={1}
              disabled={!windReady}
              onChange={(event) => {
                setInput(event.target.value);
                const node = event.target;
                node.style.height = "auto";
                node.style.height = `${Math.min(200, node.scrollHeight)}px`;
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (canSend) void send();
                }
              }}
              placeholder={
                !windReady
                  ? "Connect Navio's engines in Settings to start"
                  : mode === "spark"
                    ? "Give Spark a task to work on until it is right…"
                    : "Ask Navio for an outcome…"
              }
              className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-[14px] leading-6 text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none disabled:cursor-not-allowed"
            />

            {streaming ? (
              <button
                type="button"
                onClick={stop}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-raised)] text-[var(--color-ink)] transition-colors hover:bg-[#1d222a]"
                aria-label="Stop"
              >
                <Icon name="stop" size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void send()}
                disabled={!canSend}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] text-[#04121a] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send"
              >
                <Icon name="send" size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <div
              role="radiogroup"
              aria-label="How Navio works on this request"
              className="flex rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] p-0.5"
            >
              {MODES.map((option) => {
                const active = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-mode={option.id}
                    onClick={() => chooseMode(option.id)}
                    className={`focus-ring flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      active
                        ? option.id === "spark"
                          ? "bg-gradient-to-br from-[#ffb937] to-[#f0567f] text-[#1a0d05]"
                          : "bg-[var(--color-raised)] text-[var(--color-ink)]"
                        : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
                    }`}
                  >
                    <Icon name={option.icon} size={13} strokeWidth={option.id === "spark" ? 2 : 1.6} />
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="min-w-0 flex-1 text-[11px] leading-snug text-[var(--color-ink-faint)]">
              {mode === "spark"
                ? "Spark works in the background — draft, review, revise — until every check it set passes. You can leave this page."
                : "Navio holds anything consequential for your approval before it acts."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, userInitials }: { message: ChatMessage; userInitials: string }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3.5">
        <div className="max-w-[85%] rounded-[14px] rounded-tr-[4px] border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 py-3">
          <p className="text-[14px] leading-[1.65] whitespace-pre-wrap text-[var(--color-ink)]">{message.content}</p>
          {message.attachments && message.attachments.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {message.attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center gap-1.5 rounded-md bg-[var(--color-raised)] px-2 py-1 text-[11.5px] text-[var(--color-ink-muted)]"
                >
                  <Icon name="attach" size={11} />
                  {attachment.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[11px] font-semibold">
          {userInitials}
        </span>
      </div>
    );
  }

  if (message.sparkRunId) {
    return (
      <div className="flex gap-3.5">
        <NavioMark size={26} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <SparkRunCard runId={message.sparkRunId} fallback={message.content} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message.trace && message.trace.length > 0 ? <ExecutionTrace lanes={message.trace} collapsed /> : null}
      {message.actions && message.actions.length > 0 ? <ActionCards actions={message.actions} /> : null}
      {message.report ? <FinanceReport report={message.report} /> : null}
      <div className="flex gap-3.5">
        <NavioMark size={26} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <Markdown text={message.content} />
          {message.taskId ? (
            <Link
              href={`/app/tasks/${message.taskId}`}
              className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-2.5 py-1.5 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b323c] hover:text-[var(--color-ink)]"
            >
              <Icon name="tasks" size={13} />
              View the run
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ approval }: { approval: { id: string; title: string; summary: string } }) {
  return (
    <div className="rounded-[14px] border border-[#4a3812] bg-[#1a1408] px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-[var(--color-stream-amber)]" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-[var(--color-ink)]">{approval.title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{approval.summary}</p>
          <p className="mt-2 text-[12px] text-[var(--color-ink-faint)]">
            Nothing has been sent. Navio is holding this until someone decides.
          </p>
          <Link
            href="/app/approvals"
            className="focus-ring mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-stream-amber)]/15 px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--color-stream-amber)] transition-colors hover:bg-[var(--color-stream-amber)]/25"
          >
            Review it
            <Icon name="arrow-right" size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyChat({
  suggestions,
  onPick,
  disabled,
}: {
  suggestions: Array<{ title: string; prompt: string; hint: string }>;
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center pt-12 text-center">
      <NavioMark size={64} state="flow" />
      <h2 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
        What should Navio get done?
      </h2>
      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
        Describe the outcome, not the steps. Navio works out what it needs, runs the parts that can run at once, and
        stops for you before anything leaves the workspace.
      </p>

      <div className="mt-8 grid w-full gap-2.5 text-left sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            type="button"
            disabled={disabled}
            onClick={() => onPick(suggestion.prompt)}
            className="focus-ring panel group px-3.5 py-3 text-left transition-colors hover:border-[#2b3d4a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="block text-[13px] font-medium text-[var(--color-ink)]">{suggestion.title}</span>
            <span className="mt-1 block text-[12px] leading-relaxed text-[var(--color-ink-faint)]">
              {suggestion.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function actorOf(role: string): string {
  const map: Record<string, string> = {
    wind: "Navio",
    "wind-code": "Navio Code",
    "wind-finance": "Navio Finance",
    "wind-vision": "Navio Vision",
    "wind-reasoning": "Navio Reasoning",
    "wind-research": "Navio Research",
    "wind-data": "Navio Data",
    "wind-fast": "Navio Fast",
  };
  return map[role] ?? "Navio";
}

function kindOf(file: File): ChatAttachment["kind"] {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.includes("pdf") || name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".md")) return "document";
  if (name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) return "spreadsheet";
  if (/\.(ts|tsx|js|jsx|py|go|rs|java|rb|php|sql|sh|css|html)$/.test(name)) return "code";
  if (name.endsWith(".json") || name.endsWith(".yaml") || name.endsWith(".yml") || name.endsWith(".xml")) return "data";
  if (type.startsWith("text/")) return "document";
  return "other";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}
