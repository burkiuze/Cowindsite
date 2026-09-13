"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/primitives";

type Chunk = { sourceId: string; title: string; scope: string; text: string; score: number };

/**
 * Retrieval, made visible.
 *
 * The same retrieval Wind runs before it answers — exposed so a workspace can
 * see exactly what its agents would read, and what they would not.
 */
export function KnowledgeSearch({ canWrite }: { canWrite: boolean }) {
  const [query, setQuery] = useState("");
  const [chunks, setChunks] = useState<Chunk[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) {
      setChunks(null);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/knowledge?q=${encodeURIComponent(query)}`);
      const body = await response.json();
      setChunks(response.ok ? (body.chunks ?? []) : []);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex items-center gap-2">
        <div className="panel flex flex-1 items-center gap-2.5 px-3 py-2 focus-within:border-[#2b3d4a]">
          <Icon name="search" size={16} className="text-[var(--color-ink-faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search what Wind would retrieve…"
            className="flex-1 bg-transparent text-[13.5px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="focus-ring rounded-lg border border-[var(--color-hairline)] px-3.5 py-2.5 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          {busy ? "Searching…" : "Search"}
        </button>
        {canWrite ? (
          <span className="hidden text-[12px] text-[var(--color-ink-faint)] sm:inline">
            Your role can add sources
          </span>
        ) : null}
      </form>

      {chunks ? (
        chunks.length === 0 ? (
          <Panel className="py-8 text-center text-[13px] text-[var(--color-ink-faint)]">
            Nothing in your scopes matches that. Wind would answer without workspace context.
          </Panel>
        ) : (
          <ul className="space-y-2">
            {chunks.map((chunk, index) => (
              <li key={`${chunk.sourceId}-${index}`}>
                <Panel className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] font-medium text-[var(--color-ink)]">{chunk.title}</span>
                    <span className="text-[11px] text-[var(--color-ink-faint)]">
                      match {chunk.score.toFixed(2)} · {chunk.scope}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{chunk.text}</p>
                </Panel>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
