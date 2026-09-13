"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { NavioMark } from "@/components/brand/NavioMark";

type Turn = { role: "you" | "navio"; text: string };

const SUGGESTIONS = [
  "What does Navio actually do?",
  "When can we use it?",
  "Ne zaman kullanabiliriz?",
  "Does it need our credentials?",
];

/**
 * Ask Navio, on the public site.
 *
 * A product whose promise is "ask for an outcome" should be able to answer a
 * question on its own front page. This is the narrow version of that: it talks
 * to /api/ask, which knows about Navio and nothing else — no workspace, no
 * tools, no other visitor's words.
 *
 * It is the only chat on the site, so it sits bottom-right where a visitor
 * looks for one. Anything it cannot answer it hands to a person by naming the
 * address rather than pretending to take a message.
 */
export function AskNavio() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, pending]);

  async function ask(text: string) {
    const asked = text.trim();
    if (!asked || pending) return;
    setQuestion("");
    setTurns((current) => [...current, { role: "you", text: asked }]);
    setPending(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: asked }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      setTurns((current) => [
        ...current,
        { role: "navio", text: data.answer ?? data.error ?? "That did not go through. Try again in a moment." },
      ]);
    } catch {
      setTurns((current) => [
        ...current,
        { role: "navio", text: "That did not go through. Try again, or write to info@heynavio.com." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="focus-ring fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-panel)]/90 px-4 py-2.5 text-[13px] text-[var(--color-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur transition-transform hover:-translate-y-px"
      >
        <NavioMark size={17} state={pending ? "thinking" : "flow"} />
        {open ? "Close" : "Ask Navio"}
      </button>

      {open ? (
        <div className="panel fixed right-5 bottom-20 z-50 flex max-h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-4 py-3">
            <NavioMark size={18} state="flow" />
            <span className="text-[13.5px] font-medium text-[var(--color-ink)]">Ask Navio</span>
            <span className="ml-auto text-[11px] text-[var(--color-ink-faint)]">Ready</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {turns.length === 0 ? (
              <div>
                <p className="text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                  Ask anything about what Navio does, what it refuses to do, or when you can use it. Anything it
                  cannot answer goes to a person at info@heynavio.com.
                </p>
                <ul className="mt-4 space-y-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => ask(suggestion)}
                        className="focus-ring w-full rounded-lg border border-[var(--color-hairline)] px-3 py-2 text-left text-[12.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#33353b] hover:text-[var(--color-ink)]"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {turns.map((turn, index) => (
              <div
                key={index}
                className={
                  turn.role === "you"
                    ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[var(--color-raised)] px-3.5 py-2 text-[13px] text-[var(--color-ink)]"
                    : "max-w-[92%] text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--color-ink-muted)]"
                }
              >
                {turn.text}
              </div>
            ))}

            {pending ? (
              <p className="flex items-center gap-2 text-[12.5px] text-[var(--color-ink-faint)]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-stream-cyan)]"
                  style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }}
                />
                Working on it
              </p>
            ) : null}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(question);
            }}
            className="flex items-center gap-2 border-t border-[var(--color-hairline)] px-3 py-3"
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={400}
              placeholder="Ask about Navio…"
              aria-label="Ask about Navio"
              className="focus-ring min-w-0 flex-1 rounded-lg bg-[var(--color-surface)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
            />
            <button
              type="submit"
              disabled={pending || question.trim().length < 2}
              aria-label="Send"
              className="focus-ring rounded-lg bg-[var(--color-porcelain)] p-2 text-[var(--color-on-light)] transition-opacity disabled:opacity-40"
            >
              <Icon name="arrow-right" size={14} strokeWidth={2} />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
