import { z } from "zod";
import { sanitizeForUser } from "./redaction";
import type { FinanceReport } from "@/lib/workspace/types";

/**
 * A month's figures, lifted out of a finance lane's answer.
 *
 * The finance lane can hand back a table as well as prose: a block of JSON
 * naming what came in, what went out, and where each figure was read. Prose is
 * the wrong shape for money — a reader wants to compare this month with last,
 * and to see which line moved — so the block is parsed here, rendered as a
 * report, and cut from the text before anyone sees it.
 *
 * Everything here is written by an engine, which means none of it is trusted:
 * amounts must be finite numbers, strings are clipped and passed through the
 * same outbound guard as any other text, and a block that does not parse is
 * dropped rather than half-rendered.
 */

const Line = z.object({
  label: z.string().min(1).max(120),
  source: z.string().min(1).max(40),
  detail: z.string().max(160).optional(),
  amount: z.number().finite(),
  previousAmount: z.number().finite().optional(),
});

const Month = z.object({
  label: z.string().min(1).max(20),
  revenue: z.number().finite(),
  expenses: z.number().finite(),
});

const Report = z.object({
  month: z.string().min(1).max(40),
  previous: z.string().min(1).max(40),
  currency: z.string().min(1).max(8),
  revenue: z.array(Line).min(1).max(24),
  expenses: z.array(Line).max(40),
  history: z.array(Month).max(12),
  missing: z.array(z.string().max(160)).max(8).optional(),
});

/** Where such a block starts: `{"report": {`, however it is spaced. */
const REPORT_START = /\{\s*"report"\s*:\s*\{/;

/**
 * The span of the first report block in `text`, found by counting braces rather
 * than by pattern: the block is nested JSON, and a regex that tries to find its
 * end either stops inside it or swallows whatever follows.
 */
function findBlock(text: string): { start: number; end: number } | null {
  const opening = text.match(REPORT_START);
  if (!opening || opening.index === undefined) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = opening.index; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return { start: opening.index, end: index + 1 };
    }
  }

  return null;
}

function clean(line: z.infer<typeof Line>) {
  return {
    ...line,
    label: sanitizeForUser(line.label),
    detail: line.detail ? sanitizeForUser(line.detail) : undefined,
  };
}

/**
 * Parse the first report block in `text`, or return nothing.
 *
 * Returns the remaining text too, so the caller can carry on with an answer
 * that no longer has a wall of JSON in the middle of it.
 */
export function extractReport(text: string): { report?: FinanceReport; text: string } {
  const span = findBlock(text);
  if (!span) return { text };

  const block = text.slice(span.start, span.end);
  const rest = (text.slice(0, span.start) + text.slice(span.end)).replace(/\n{3,}/g, "\n\n").trim();
  try {
    const parsed = Report.parse((JSON.parse(block) as { report: unknown }).report);
    return {
      report: {
        ...parsed,
        month: sanitizeForUser(parsed.month),
        previous: sanitizeForUser(parsed.previous),
        revenue: parsed.revenue.map(clean),
        expenses: parsed.expenses.map(clean),
        missing: parsed.missing?.map((entry) => sanitizeForUser(entry)),
      },
      text: rest,
    };
  } catch {
    // A block that does not hold up is not a report. Drop it — but still take
    // it out of the answer, because half-written JSON is not prose either.
    return { text: rest };
  }
}
