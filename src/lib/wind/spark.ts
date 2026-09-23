import "server-only";
import { callWithFallback } from "./fallback";
import { primaryComplete } from "./adapters/primary";
import { heuristicClassify } from "./classifier";
import { windSystemPrompt, type PromptContext } from "./prompts";
import { classifyError, sanitizeForUser } from "./redaction";
import { extractTool, stripToolMarkers, type ApprovalDraft } from "./runtime";
import { asContext, gather } from "./tools/gather";
import { newTraceId, telemetry } from "./telemetry";
import type { AvailableTool } from "./executor";
import type { SparkCheck, SparkRound, SparkRun } from "@/lib/workspace/types";

/**
 * Spark — work that keeps going until it is right.
 *
 * Normal mode is one pass while a person watches. Spark is the other shape of
 * work: the request is taken away and worked on the server, round after round,
 * until it clears a bar Navio sets for it up front.
 *
 *   read    → the connected tools it is allowed to read, once
 *   bar     → 4–7 concrete checks the finished result must pass
 *   draft   → a complete first version
 *   review  → every check, strictly, one verdict each
 *   revise  → fix what failed without breaking what passed
 *   …repeat review/revise until every check passes or the rounds run out
 *   prepare → if the request asks for something to be sent or changed, the
 *             action is drafted from the final version and held for approval
 *
 * It never claims more than it did. A run that passes says it passed; a run
 * that hits the round limit says so and lists what is still open; a run a
 * person stops keeps its latest draft and says it was stopped. Spark polishes
 * the work — it does not widen what Navio may do, so the only way out of this
 * module to the outside world is a read, or an approval request.
 */

export const SPARK_MAX_ROUNDS = 4;
const MIN_CRITERIA = 3;
const MAX_CRITERIA = 7;

export interface SparkServices {
  /** Register the prepared action for a person's decision. */
  requestApproval?: (draft: ApprovalDraft) => Promise<{ id: string } | null>;
  /** Called after every change to the run, for anything that mirrors it. */
  onChange?: (run: SparkRun) => void;
}

export interface SparkInput {
  /** The run to fill in. Mutated in place: readers see progress as it happens. */
  run: SparkRun;
  prompt: PromptContext;
  availableTools: AvailableTool[];
  actor: string;
  services?: SparkServices;
  /**
   * Wall-clock budget for the whole run. A background run is still bounded:
   * when the budget runs out Spark finishes with the best version it has and
   * says the round limit was reached, rather than being cut off mid-sentence.
   */
  budgetMs?: number;
}

export async function runSpark({
  run,
  prompt,
  availableTools,
  actor,
  services = {},
  budgetMs = 230_000,
}: SparkInput): Promise<SparkRun> {
  const traceId = newTraceId();
  const deadline = Date.now() + budgetMs;
  const changed = () => services.onChange?.(run);
  const system = windSystemPrompt(prompt);
  const heuristic = heuristicClassify(run.request);

  try {
    // ---- read ------------------------------------------------------------
    run.phase = "reading";
    changed();
    const reads = await gather({
      request: run.request,
      intent: heuristic.intent,
      available: availableTools,
      actor,
      traceId,
      emit: (action) => {
        const record = { id: action.id, integrationId: action.integrationId, label: action.label, status: action.status };
        const seen = run.reads.findIndex((entry) => entry.id === action.id);
        if (seen >= 0) run.reads[seen] = record;
        else run.reads.push(record);
        changed();
      },
    });
    const context = asContext(reads);
    if (stopped(run, changed)) return run;

    // ---- the bar ---------------------------------------------------------
    run.phase = "criteria";
    changed();
    run.criteria = await setTheBar(run.request, context, traceId);
    changed();
    if (stopped(run, changed)) return run;

    // ---- draft, review, revise --------------------------------------------
    let draft = "";
    let failed: SparkCheck[] = [];

    for (let n = 1; n <= run.maxRounds; n += 1) {
      // A revision round costs two engine calls; do not start one that the
      // budget cannot finish.
      if (n > 1 && Date.now() > deadline) break;
      const round: SparkRound = { n, kind: n === 1 ? "draft" : "revision", startedAt: Date.now(), checks: [] };
      run.rounds.push(round);
      run.phase = n === 1 ? "drafting" : "revising";
      changed();

      draft =
        n === 1
          ? await write(system, draftPrompt(run.request, run.criteria, context), traceId)
          : await write(system, revisionPrompt(run.request, run.criteria, draft, failed, n, context), traceId);
      run.draft = stripToolMarkers(sanitizeForUser(draft));
      changed();
      if (stopped(run, changed)) return run;

      run.phase = "reviewing";
      changed();
      round.checks = await review(run.request, run.criteria, draft, n, traceId);
      round.passed = round.checks.every((check) => check.ok);
      round.finishedAt = Date.now();
      failed = round.checks.filter((check) => !check.ok);
      changed();

      telemetry.route(traceId, `spark round ${n}: ${round.checks.length - failed.length}/${round.checks.length}`);

      if (round.passed) {
        run.outcome = "passed";
        break;
      }
      if (stopped(run, changed)) return run;
    }
    run.outcome ??= "limit";

    // ---- prepare ---------------------------------------------------------
    // Only now, from the version that cleared the bar (or came closest), is
    // the action drafted — polishing an email that was never going to be sent
    // in that shape would be work for nothing.
    const writable = availableTools.filter((tool) => tool.effect === "write");
    const wantsAction = heuristic.intent === "ACTION_REQUEST" || heuristic.scores.ACTION_REQUEST > 0;
    if (wantsAction && writable.length > 0 && services.requestApproval) {
      run.phase = "preparing";
      changed();
      const planned = await write(system, actionPrompt(run.request, draft, writable), traceId);
      const chosen = extractTool(planned, availableTools);
      if (chosen.tool) {
        const last = run.rounds[run.rounds.length - 1];
        const passed = last?.checks.filter((check) => check.ok).length ?? 0;
        const approval = await services.requestApproval({
          title: subjectOf(chosen.payload) || firstLine(chosen.payload) || "Prepared by Spark",
          // Say what the approver is being handed: a version that passed, or
          // one that ran out of rounds with checks still open.
          summary:
            run.outcome === "passed"
              ? `Prepared by Spark from a version that passed all ${last?.checks.length ?? 0} of its checks, in ${run.rounds.length} rounds.`
              : `Prepared by Spark after ${run.rounds.length} rounds — ${passed} of ${last?.checks.length ?? 0} checks passed, the rest still open.`,
          payload: chosen.payload,
          risk: "medium",
          toolId: chosen.tool.id,
          integrationId: chosen.tool.integrationId,
          steps: chosen.steps,
        });
        if (approval) run.approvalId = approval.id;
      }
    }

    run.status = "completed";
    run.phase = "done";
    run.finishedAt = Date.now();
    changed();
    return run;
  } catch (error) {
    const code = classifyError(error);
    telemetry.error(traceId, "spark run failed", { code });
    run.status = "failed";
    run.phase = "done";
    // What a person reads: calm, specific to what happened, nothing internal.
    run.error = run.draft
      ? "Spark could not finish its last round. The latest draft is kept below — nothing was sent."
      : "Spark could not start this run. Nothing was changed — try again.";
    run.finishedAt = Date.now();
    changed();
    return run;
  }
}

/** Honour a stop between steps. Returns true when the run should end here. */
function stopped(run: SparkRun, changed: () => void): boolean {
  if (!run.stopRequested) return false;
  run.status = "stopped";
  run.phase = "done";
  run.finishedAt = Date.now();
  changed();
  return true;
}

async function write(system: string, content: string, traceId: string): Promise<string> {
  const result = await callWithFallback({
    preferredKey: "wind.reasoning",
    messages: [
      { role: "system", content: system },
      { role: "user", content },
    ],
    traceId,
    maxTokens: 3_000,
  });
  return result.text.trim();
}

async function setTheBar(request: string, context: string, traceId: string): Promise<string[]> {
  try {
    const result = await primaryComplete(
      [
        { role: "system", content: "You set quality bars for work. Output JSON only." },
        { role: "user", content: criteriaPrompt(request, context) },
      ],
      traceId,
      { temperature: 0, maxTokens: 600 },
    );
    const parsed = parseCriteria(result.text);
    if (parsed.length >= MIN_CRITERIA) return parsed;
  } catch {
    // Fall through to the standing bar below.
  }
  // The bar every result is held to when a tailored one is unavailable. Generic
  // on purpose — it is labelled as the fallback by being plainly general.
  return [
    "Answers everything the request asks for, and nothing it did not.",
    "Every figure, date and name comes from the request or from the data that was read.",
    "Anything that could not be determined is said plainly rather than filled in.",
    "Ends with the concrete next step, and who takes it.",
  ];
}

async function review(request: string, criteria: string[], draft: string, n: number, traceId: string): Promise<SparkCheck[]> {
  try {
    const result = await callWithFallback({
      preferredKey: "wind.reasoning",
      messages: [
        { role: "system", content: "You review work strictly against a checklist. Output JSON only." },
        { role: "user", content: reviewPrompt(request, criteria, draft, n) },
      ],
      traceId,
      temperature: 0,
      maxTokens: 900,
    });
    return alignChecks(criteria, parseChecks(result.text));
  } catch {
    // A review that did not happen is not a pass.
    return criteria.map((criterion) => ({ criterion, ok: false, issue: "This round's review did not complete." }));
  }
}

// ---- parsing ---------------------------------------------------------------

export function parseCriteria(raw: string): string[] {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { criteria?: unknown };
    if (!Array.isArray(parsed.criteria)) return [];
    return parsed.criteria
      .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      .map((entry) => sanitizeForUser(entry.trim()).slice(0, 200))
      .slice(0, MAX_CRITERIA);
  } catch {
    return [];
  }
}

export function parseChecks(raw: string): Array<{ criterion?: string; ok: boolean; issue?: string }> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { checks?: unknown };
    if (!Array.isArray(parsed.checks)) return [];
    return parsed.checks
      .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
      .map((entry) => ({
        criterion: typeof entry.criterion === "string" ? entry.criterion : undefined,
        // Only an explicit true passes. "Mostly", a string, a missing field: fail.
        ok: entry.ok === true,
        issue: typeof entry.issue === "string" && entry.issue.trim() ? entry.issue.trim() : undefined,
      }));
  } catch {
    return [];
  }
}

/**
 * One verdict per criterion, in the bar's own order.
 *
 * Matched by text first, then by position. A criterion the review skipped is
 * recorded as failed — silence from a reviewer is not approval.
 */
export function alignChecks(
  criteria: string[],
  checks: Array<{ criterion?: string; ok: boolean; issue?: string }>,
): SparkCheck[] {
  const normalise = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();
  return criteria.map((criterion, index) => {
    const verdict =
      checks.find((check) => check.criterion && normalise(check.criterion) === normalise(criterion)) ?? checks[index];
    if (!verdict) return { criterion, ok: false, issue: "The review did not cover this check." };
    if (verdict.ok) return { criterion, ok: true };
    return {
      criterion,
      ok: false,
      issue: sanitizeForUser(verdict.issue ?? "Does not yet meet this check.").slice(0, 280),
    };
  });
}

// ---- prompts ---------------------------------------------------------------

function criteriaPrompt(request: string, context: string): string {
  return [
    "Spark quality bar.",
    "Before any work starts, set the bar the finished result must clear.",
    'Return JSON only: {"criteria": ["...", "..."]} with 4 to 7 checks.',
    "Each check is one concrete, verifiable sentence about THIS request — what must be in the result and what must be true of it.",
    "No generic virtues like 'clear' or 'professional'. Write the checks in the same language as the request.",
    "",
    `Request:\n${request.slice(0, 4_000)}`,
    context ? `\n${context.slice(0, 8_000)}` : "",
  ].join("\n");
}

function draftPrompt(request: string, criteria: string[], context: string): string {
  return [
    "Spark draft, round 1.",
    "Produce the complete deliverable for the request below — the thing itself, not a plan for it.",
    "It will be reviewed strictly against these checks:",
    ...criteria.map((criterion, index) => `  ${index + 1}. ${criterion}`),
    "",
    "Use only facts from the request and the data below. Where something is unknown, say so instead of filling it in.",
    "Write in the language of the request.",
    "",
    `Request:\n${request.slice(0, 4_000)}`,
    context ? `\n${context.slice(0, 12_000)}` : "",
  ].join("\n");
}

function reviewPrompt(request: string, criteria: string[], draft: string, n: number): string {
  return [
    `Spark review, round ${n}.`,
    "Review the draft strictly against each check. A check passes only if the draft fully meets it as written.",
    'Return JSON only: {"checks": [{"criterion": "<the check, verbatim>", "ok": true|false, "issue": "<what falls short, one line; omit when ok>"}]}',
    "One entry per check, in order. Do not rewrite the draft. Write issues in the language of the request.",
    "",
    "Checks:",
    ...criteria.map((criterion, index) => `  ${index + 1}. ${criterion}`),
    "",
    `Request:\n${request.slice(0, 2_000)}`,
    "",
    `Draft:\n${draft.slice(0, 16_000)}`,
  ].join("\n");
}

function revisionPrompt(
  request: string,
  criteria: string[],
  draft: string,
  failed: SparkCheck[],
  n: number,
  context: string,
): string {
  return [
    `Spark revision, round ${n}.`,
    "Revise the draft so every failed check below is met, without breaking any check that already passed.",
    "Return the complete revised deliverable only — no notes about what changed.",
    "",
    "Failed checks:",
    ...failed.map((check) => `  - ${check.criterion}\n    Issue: ${check.issue ?? "not met"}`),
    "",
    "All checks:",
    ...criteria.map((criterion, index) => `  ${index + 1}. ${criterion}`),
    "",
    `Request:\n${request.slice(0, 4_000)}`,
    context ? `\n${context.slice(0, 8_000)}` : "",
    "",
    `Current draft:\n${draft.slice(0, 16_000)}`,
  ].join("\n");
}

function actionPrompt(request: string, draft: string, writable: AvailableTool[]): string {
  return [
    "Draft the exact action that carries out this request, built from the final version below.",
    "",
    "Tools this workspace can actually reach:",
    ...writable.map((tool) => `  ${tool.id} — ${tool.name}`),
    "",
    "Begin your output with a single line `TOOL: <id>` naming the one tool that would carry this out,",
    "choosing only from the list above. If none of them fits, write `TOOL: none`.",
    "Then, on the following lines, write the exact content of the action.",
    "",
    `Request:\n${request.slice(0, 4_000)}`,
    "",
    `Final version:\n${draft.slice(0, 16_000)}`,
  ].join("\n");
}

function firstLine(text: string): string {
  const line = text.split("\n").find((candidate) => candidate.trim().length > 0) ?? "";
  return line.replace(/^#+\s*/, "").replace(/\*\*/g, "").slice(0, 160);
}

/** An email's subject line, when the action has one: a better title than its first line. */
function subjectOf(payload: string): string {
  const match = payload.match(/^\s*(?:Konu|Subject):\s*(.+)$/im);
  return match ? match[1].trim().slice(0, 160) : "";
}
