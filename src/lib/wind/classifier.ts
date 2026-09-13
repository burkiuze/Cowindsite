import type { Attachment, Complexity, Intent, WindMessage } from "./types";

/**
 * Intent + complexity classification.
 *
 * Two stages:
 *   1. `heuristicClassify` — deterministic, instant, no network. It reads
 *      attachments, message shape, verbs and domain vocabulary (English and
 *      Turkish), and returns intent scores plus a confidence.
 *   2. `assistedClassify` in `router.ts` — consulted only when stage one is not
 *      confident enough, using the fast primary engine.
 *
 * Stage one is pure so it can be unit tested and so the common case ("Selam")
 * never pays for a classification round-trip.
 */

export interface HeuristicResult {
  intent: Intent;
  scores: Record<Intent, number>;
  complexity: Complexity;
  confidence: number;
  signals: string[];
  /** Extra intents that scored close behind the winner. */
  secondary: Intent[];
}

type Lexicon = Partial<Record<Intent, string[]>>;

/**
 * Domain vocabulary. Deliberately bilingual: Navio's first users work in
 * Turkish and English in the same thread.
 */
const LEXICON: Lexicon = {
  CODING: [
    "code", "codebase", "repo", "repository", "function", "bug", "stack trace", "compile",
    "typescript", "javascript", "python", "rust", "golang", "sql query", "refactor", "merge",
    "pull request", "unit test", "api endpoint", "deploy", "build fail", "exception", "regex",
    "kod", "yazılım", "hata", "derle", "fonksiyon", "depo", "test yaz", "bug bul", "çöz",
  ],
  FINANCE: [
    "sponsorship", "sponsorluk", "sponsor", "contract value", "anlaşma bedeli", "sözleşme bedeli",
    "revenue", "burn rate", "runway", "balance sheet", "income statement", "cash flow", "ebitda",
    "valuation", "margin", "arr", "mrr", "cap table", "invoice", "budget", "forecast", "p&l",
    "investment", "portfolio", "bilanço", "gelir", "gider", "bütçe", "nakit akışı", "yatırım",
    "finansal", "kâr", "kar marjı", "ciro", "maliyet", "faiz",
  ],
  VISION: [
    "image", "photo", "screenshot", "picture", "diagram", "chart image", "what is in this",
    "fotoğraf", "görsel", "resim", "ekran görüntüsü", "bu görüntüde",
  ],
  DOCUMENT: [
    "document", "pdf", "contract", "policy", "report file", "attached file", "spec sheet",
    "belge", "sözleşme", "doküman", "rapor dosyası", "ek dosya",
  ],
  RESEARCH: [
    "research", "competitor", "market", "benchmark", "landscape", "compare vendors", "trends",
    "araştır", "rakip", "pazar", "karşılaştır", "trend", "inceleme yap",
  ],
  DATA_EXTRACTION: [
    "extract", "parse", "json", "csv", "convert to table", "list the", "pull out", "normalize",
    "çıkar", "ayıkla", "listele", "tabloya çevir", "dönüştür",
    // Reading a day out of a calendar or agenda is extraction work. Kept as
    // phrases: "program" alone means something else entirely in software.
    "check the schedule", "check the calendar", "tomorrow's agenda", "tomorrow's schedule",
    "programına göz at", "programımıza göz at", "takvimi kontrol", "takvime bak", "gündemi çıkar",
    "günü planla",
  ],
  COMPLEX_REASONING: [
    "analyze deeply", "contradiction", "trade-off", "root cause", "strategy", "assess risk",
    "implications", "second-order", "derinlemesine", "çelişki", "strateji", "risk analizi",
  ],
  ACTION_REQUEST: [
    "send", "email", "post", "publish", "schedule", "create ticket", "update the", "delete",
    "notify", "message the team", "gönder", "yayınla", "planla", "oluştur", "güncelle", "sil",
    "bildir", "paylaş",
    // Scheduling is the most common consequential action a workspace asks for,
    // and it was previously invisible to the router in Turkish.
    "schedule a meeting", "set up a meeting", "book a meeting", "send an invite", "invite the",
    "add to the calendar", "toplantı ayarla", "toplantı kur", "toplantı oluştur", "toplantı planla",
    "davet gönder", "davetiye", "takvime ekle", "randevu ayarla", "toplantı ayarlar",
  ],
  WORKFLOW_REQUEST: [
    "every week", "recurring", "automate", "workflow", "whenever", "each morning", "pipeline",
    "her hafta", "otomatikleştir", "iş akışı", "her sabah", "düzenli olarak", "tekrarlayan",
  ],
  LONG_CONTEXT: [
    "whole document", "entire repo", "all files", "300 page", "full transcript", "across all",
    "tüm belge", "bütün dosyalar", "tamamını", "sayfalık",
  ],
};

/**
 * Verbs that ask for analysis without naming a domain. They raise complexity
 * but must not outvote a domain signal: "bilançoyu analiz et" is finance work,
 * not generic reasoning.
 */
const ANALYSIS_VERBS = [
  "analyse", "analyze", "evaluate", "assess", "review", "examine", "deep dive",
  "analiz", "incele", "değerlendir", "gözden geçir", "irdele",
];

const GREETINGS = [
  "hi", "hey", "hello", "yo", "good morning", "good evening", "thanks", "thank you", "ok", "okay",
  "selam", "merhaba", "günaydın", "iyi akşamlar", "teşekkürler", "sağ ol", "naber", "nasılsın",
];

const INTENTS: Intent[] = [
  "GENERAL", "CODING", "FINANCE", "VISION", "DOCUMENT", "RESEARCH", "LONG_CONTEXT",
  "DATA_EXTRACTION", "COMPLEX_REASONING", "MULTI_DOMAIN", "ACTION_REQUEST", "WORKFLOW_REQUEST",
];

/** Intents that name a field of work rather than a mode of thinking. */
const DOMAIN_INTENTS: Intent[] = ["CODING", "FINANCE", "VISION", "DOCUMENT", "DATA_EXTRACTION", "RESEARCH", "LONG_CONTEXT"];

function emptyScores(): Record<Intent, number> {
  return INTENTS.reduce(
    (acc, intent) => {
      acc[intent] = 0;
      return acc;
    },
    {} as Record<Intent, number>,
  );
}

/** Rough token estimate; good enough for context routing. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.6);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function heuristicClassify(message: string, attachments: Attachment[] = [], history: WindMessage[] = []): HeuristicResult {
  const text = normalize(message);
  const scores = emptyScores();
  const signals: string[] = [];

  // --- attachments are the strongest signal --------------------------------
  for (const attachment of attachments) {
    switch (attachment.kind) {
      case "image":
        scores.VISION += 6;
        signals.push("image attached");
        break;
      case "document":
        scores.DOCUMENT += 4;
        scores.COMPLEX_REASONING += 1;
        signals.push("document attached");
        break;
      case "spreadsheet":
        scores.FINANCE += 3;
        scores.DATA_EXTRACTION += 2;
        signals.push("spreadsheet attached");
        break;
      case "code":
        scores.CODING += 5;
        signals.push("code attached");
        break;
      case "data":
        scores.DATA_EXTRACTION += 4;
        signals.push("structured data attached");
        break;
      default:
        break;
    }
    if (attachment.text && estimateTokens(attachment.text) > 24_000) {
      scores.LONG_CONTEXT += 5;
      signals.push("large attachment");
    }
  }

  // --- vocabulary ----------------------------------------------------------
  for (const [intent, terms] of Object.entries(LEXICON) as Array<[Intent, string[]]>) {
    for (const term of terms) {
      if (text.includes(term)) {
        scores[intent] += term.includes(" ") ? 3 : 2;
        signals.push(`term:${term}`);
      }
    }
  }

  let analysisVerbs = 0;
  for (const verb of ANALYSIS_VERBS) {
    if (text.includes(verb)) {
      analysisVerbs += 1;
      scores.COMPLEX_REASONING += 1;
      signals.push(`verb:${verb}`);
    }
  }

  // --- shape ---------------------------------------------------------------
  const words = text.split(" ").filter(Boolean);
  const isGreeting = words.length <= 4 && GREETINGS.some((g) => text === g || text.startsWith(`${g} `) || text.startsWith(`${g},`));
  if (isGreeting) {
    scores.GENERAL += 8;
    signals.push("greeting");
  }

  if (/```|\bfunction\s|\bclass\s|=>|\bimport\s|\bdef\s|;\s*$/m.test(message)) {
    scores.CODING += 4;
    signals.push("code block");
  }
  if (/^\s*[[{]/.test(message.trim()) && /["':]/.test(message)) {
    scores.DATA_EXTRACTION += 3;
    signals.push("structured payload");
  }
  if (/\b\d{2,}\s?(pages?|sayfa\w*)\b/.test(text) || estimateTokens(message) > 12_000) {
    scores.LONG_CONTEXT += 4;
    signals.push("long input");
  }
  if (/\b(and also|plus|as well as|hem de|ayrıca|bir de)\b/.test(text) && words.length > 18) {
    scores.MULTI_DOMAIN += 2;
    signals.push("compound request");
  }

  // A request that names two or more distinct domains is multi-domain work.
  const domainHits = (["CODING", "FINANCE", "RESEARCH", "COMPLEX_REASONING", "VISION"] as Intent[]).filter(
    (intent) => scores[intent] >= 3,
  );
  if (domainHits.length >= 2) {
    scores.MULTI_DOMAIN += 3 + domainHits.length;
    signals.push(`domains:${domainHits.length}`);
  }

  // Continuation of an established thread inherits some of its intent.
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
  if (lastAssistant && words.length <= 6 && !isGreeting) {
    scores.GENERAL += 1;
    signals.push("short follow-up");
  }

  const ranked = INTENTS.map((intent) => ({ intent, score: scores[intent] })).sort((a, b) => b.score - a.score);
  let top = ranked[0];
  const runnerUp = ranked[1];

  // "Analyse the balance sheet" is finance work. When generic reasoning wins
  // only because of an analysis verb, hand the request back to the domain.
  if (top.intent === "COMPLEX_REASONING" && analysisVerbs > 0) {
    const domain = ranked.find(
      (entry) =>
        DOMAIN_INTENTS.includes(entry.intent) && entry.score > 0 && entry.score >= top.score - analysisVerbs,
    );
    if (domain) top = domain;
  }

  // "Schedule the release meeting, review the open pull requests and invite the
  // team" is an action that happens to be about code. When the request asks for
  // something to be done at least as strongly as it names a subject, the action
  // wins: its plan runs a pass over that subject anyway, so nothing is lost, and
  // an action that routes as analysis silently stops short of doing the work.
  if (top.intent !== "ACTION_REQUEST" && scores.ACTION_REQUEST > 0 && scores.ACTION_REQUEST >= top.score) {
    top = { intent: "ACTION_REQUEST", score: scores.ACTION_REQUEST };
    signals.push("action wins tie");
  }

  const intent: Intent = top.score === 0 ? "GENERAL" : top.intent;
  const spread = top.score - (runnerUp?.score ?? 0);
  const confidence = top.score === 0 ? (isGreeting ? 0.95 : 0.45) : Math.min(0.98, 0.5 + spread * 0.09 + top.score * 0.03);

  const secondary = ranked
    .slice(1)
    .filter((entry) => entry.score >= 3 && entry.score >= top.score - 3)
    .map((entry) => entry.intent);

  return {
    intent,
    scores,
    complexity: estimateComplexity(message, attachments, intent, scores),
    confidence,
    signals: [...new Set(signals)].slice(0, 12),
    secondary,
  };
}

export function estimateComplexity(
  message: string,
  attachments: Attachment[],
  intent: Intent,
  scores: Record<Intent, number>,
): Complexity {
  const text = normalize(message);
  const words = text.split(" ").filter(Boolean).length;

  if (words <= 4 && attachments.length === 0 && scores.GENERAL > 0) return "trivial";

  let weight = 0;
  if (words > 25) weight += 1;
  if (words > 80) weight += 1;
  if (attachments.length > 0) weight += 1;
  if (attachments.length > 2) weight += 1;
  if (scores.MULTI_DOMAIN >= 4) weight += 2;
  if (scores.LONG_CONTEXT >= 4) weight += 2;
  if (intent === "COMPLEX_REASONING" || intent === "RESEARCH") weight += 1;
  if (scores.COMPLEX_REASONING >= 2) weight += 1;
  if (intent === "WORKFLOW_REQUEST") weight += 1;
  if (/\b(report|plan|strategy|audit|review everything|rapor|plan|denetim|strateji)\b/.test(text)) weight += 1;
  if (/\b(and|then|after that|ve|sonra)\b.*\b(and|then|ve|sonra)\b/.test(text)) weight += 1;

  if (weight >= 4) return "deep";
  if (weight >= 2) return "standard";
  if (weight >= 1) return "simple";
  return words <= 8 ? "trivial" : "simple";
}

/** Prompt used when the heuristic is not confident enough to stand alone. */
export function classifierPrompt(message: string, attachmentSummary: string): string {
  return [
    "You are Navio's internal task classifier. Answer with one compact JSON object and nothing else.",
    "",
    "Fields:",
    '  intent: one of GENERAL, CODING, FINANCE, VISION, DOCUMENT, RESEARCH, LONG_CONTEXT, DATA_EXTRACTION, COMPLEX_REASONING, MULTI_DOMAIN, ACTION_REQUEST, WORKFLOW_REQUEST',
    '  complexity: one of trivial, simple, standard, deep',
    '  domains: array of zero or more of code, finance, research, visual, data, operations',
    '  needs_action: boolean — true if the user is asking for something to be sent, posted, changed or created outside this chat',
    '  summary: max 12 words describing the work, safe to show a user',
    "",
    `Attachments: ${attachmentSummary || "none"}`,
    "",
    "User request:",
    message.slice(0, 4_000),
  ].join("\n");
}

export function parseClassifierJson(raw: string): {
  intent?: Intent;
  complexity?: Complexity;
  domains?: string[];
  needs_action?: boolean;
  summary?: string;
} | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    const intent = typeof parsed.intent === "string" ? (parsed.intent.toUpperCase() as Intent) : undefined;
    const complexity =
      typeof parsed.complexity === "string" ? (parsed.complexity.toLowerCase() as Complexity) : undefined;
    return {
      intent: intent && INTENTS.includes(intent) ? intent : undefined,
      complexity:
        complexity && ["trivial", "simple", "standard", "deep"].includes(complexity) ? complexity : undefined,
      domains: Array.isArray(parsed.domains) ? parsed.domains.filter((d): d is string => typeof d === "string") : [],
      needs_action: typeof parsed.needs_action === "boolean" ? parsed.needs_action : false,
      summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 120) : undefined,
    };
  } catch {
    return null;
  }
}
