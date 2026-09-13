import "server-only";
import { store } from "./store";
import type { KnowledgeSource, WorkspaceMember } from "./types";

/**
 * Workspace knowledge retrieval.
 *
 * Memory in Navio is scoped, not global. A retrieval always runs as a specific
 * member (and optionally as a specific agent), and a source is only visible
 * when both the member's departments and the agent's granted scopes allow it.
 * Finance knowledge does not leak into an engineering agent because it happens
 * to be in the same workspace.
 *
 * Retrieval itself is a deliberately simple lexical scorer: transparent,
 * instant, and dependency-free. The interface is what matters — swap the body
 * for embeddings and nothing above it changes.
 */

export interface RetrievalOptions {
  member: WorkspaceMember;
  /** Restrict further to an agent's own knowledge scopes. */
  agentScopes?: string[];
  limit?: number;
  /** Minimum score a chunk must reach to be returned. */
  threshold?: number;
}

export interface RetrievedChunk {
  sourceId: string;
  title: string;
  scope: string;
  text: string;
  score: number;
}

export interface RetrievalResult {
  text: string;
  sources: string[];
  chunks: RetrievedChunk[];
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "was", "were", "be", "with",
  "that", "this", "it", "as", "at", "by", "from", "our", "we", "you", "me", "my", "i", "what", "how", "why",
  "ve", "bir", "bu", "şu", "için", "ile", "de", "da", "mi", "mı", "ne", "nasıl", "ben", "biz", "bana",
]);

export function visibleSources(options: RetrievalOptions): KnowledgeSource[] {
  const { member, agentScopes } = options;
  return store().knowledge.filter((source) => {
    // Workspace-wide sources are visible to every member.
    const departmentAllowed =
      source.departmentIds.length === 0 ||
      source.departmentIds.some((departmentId) => member.departmentIds.includes(departmentId)) ||
      member.role === "owner" ||
      member.role === "admin";

    const scopeAllowed = !agentScopes || agentScopes.length === 0 || agentScopes.includes(source.scope);
    return departmentAllowed && scopeAllowed;
  });
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

/** Paragraph-level chunks keep citations readable. */
function chunksOf(source: KnowledgeSource): string[] {
  return source.content
    .split(/\n{2,}/)
    .flatMap((block) => (block.length > 900 ? block.match(/[\s\S]{1,900}/g) ?? [] : [block]))
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function retrieve(query: string, options: RetrievalOptions): RetrievalResult {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return { text: "", sources: [], chunks: [] };

  const sources = visibleSources(options);
  const scored: RetrievedChunk[] = [];

  for (const source of sources) {
    const titleTokens = new Set(tokenize(source.title));
    for (const chunk of chunksOf(source)) {
      const chunkTokens = tokenize(chunk);
      if (chunkTokens.length === 0) continue;
      const chunkSet = new Set(chunkTokens);

      let score = 0;
      for (const token of queryTokens) {
        if (chunkSet.has(token)) score += 1;
        // Partial matches catch inflected forms without a stemmer.
        else if (chunkTokens.some((candidate) => candidate.startsWith(token.slice(0, 5)) && token.length > 4)) score += 0.5;
        if (titleTokens.has(token)) score += 0.75;
      }

      // Normalise so a long chunk cannot win on length alone.
      const normalized = score / Math.sqrt(Math.max(6, chunkTokens.length / 6));
      if (normalized > 0) {
        scored.push({ sourceId: source.id, title: source.title, scope: source.scope, text: chunk, score: normalized });
      }
    }
  }

  const threshold = options.threshold ?? 0.35;
  const limit = options.limit ?? 6;
  const top = scored.filter((chunk) => chunk.score >= threshold).sort((a, b) => b.score - a.score).slice(0, limit);

  if (top.length === 0) return { text: "", sources: [], chunks: [] };

  const titles = [...new Set(top.map((chunk) => chunk.title))];
  const text = top.map((chunk) => `[${chunk.title}]\n${chunk.text}`).join("\n\n");

  return { text, sources: titles, chunks: top };
}
