/**
 * Integration catalogue generator.
 *
 * Source of truth is Composio's public logo set (ComposioHQ/open-logos): one
 * file per toolkit, which gives both the catalogue and each service's real
 * brand mark. This script normalises the filenames into slugs, writes an
 * optimised 96px WebP per service into `public/logos`, and emits a typed
 * catalogue at `src/lib/workspace/catalog.generated.ts`.
 *
 * Re-sync after pulling a newer copy of the logo set:
 *   git clone --depth 1 https://github.com/ComposioHQ/open-logos /tmp/open-logos
 *   node scripts/sync-integrations.mjs /tmp/open-logos
 *
 * Nothing here runs at build or request time — the generated file is committed.
 */
import { readdirSync, statSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const SOURCE = process.argv[2] ?? "/home/user/composiohq/open-logos";
const OUT_DIR = "public/logos";
const OUT_FILE = "src/lib/workspace/catalog.generated.ts";
const SIZE = 96;

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg"]);

/**
 * Services that must never appear in the catalogue.
 *
 * Cowind presents one assistant, Wind, and nothing about the private engine
 * layer may surface anywhere in the product. A gateway that serves Wind's own
 * specialists would name that layer just by being listed next to 770 ordinary
 * SaaS tools, so it is excluded here — at the source, not by filtering later.
 */
const EXCLUDED = new Set(["openrouter"]);

/** Brands whose display name does not survive naive title-casing. */
const NAME_OVERRIDES = {
  github: "GitHub", gitlab: "GitLab", hubspot: "HubSpot", pagerduty: "PagerDuty",
  whatsapp: "WhatsApp", youtube: "YouTube", linkedin: "LinkedIn", mongodb: "MongoDB",
  postgresql: "PostgreSQL", mysql: "MySQL", typeform: "Typeform", surveymonkey: "SurveyMonkey",
  docusign: "DocuSign", quickbooks: "QuickBooks", freshbooks: "FreshBooks", bamboohr: "BambooHR",
  clickup: "ClickUp", onedrive: "OneDrive", sharepoint: "SharePoint", bigquery: "BigQuery",
  wordpress: "WordPress", woocommerce: "WooCommerce", paypal: "PayPal", sendgrid: "SendGrid",
  mailchimp: "Mailchimp", activecampaign: "ActiveCampaign", zoominfo: "ZoomInfo",
  salesforce: "Salesforce", servicenow: "ServiceNow", workday: "Workday", netsuite: "NetSuite",
  openai: "OpenAI", elevenlabs: "ElevenLabs", huggingface: "Hugging Face", deepl: "DeepL",
  tinyurl: "TinyURL", ipstack: "ipstack", ahrefs: "Ahrefs", semrush: "Semrush",
  "google-drive": "Google Drive", "google-docs": "Google Docs", "google-sheets": "Google Sheets",
  "google-calendar": "Google Calendar", "google-maps": "Google Maps", "google-meet": "Google Meet",
  "google-photos": "Google Photos", "google-analytics": "Google Analytics",
  "microsoft-teams": "Microsoft Teams", "dynamics-365": "Dynamics 365", "cal-com": "Cal.com",
  "rocket-chat": "Rocket.Chat", "customer-io": "Customer.io", "one-drive": "OneDrive",
};

/**
 * Curated categories for services a visitor is likely to filter by. Keyword
 * rules handle the rest; anything genuinely ambiguous stays "other" rather than
 * being guessed into the wrong shelf.
 */
const CATEGORY_OVERRIDES = {
  atlassian: "development", auth0: "security", bitwarden: "security", okta: "security",
  onepassword: "security", snyk: "security", cloudflare: "development", vercel: "development",
  netlify: "development", heroku: "development", render: "development", railway: "development",
  digitalocean: "development", linode: "development", contentful: "development",
  sanity: "development", strapi: "development", webflow: "productivity", wordpress: "marketing",
  ghost: "marketing", medium: "marketing", substack: "marketing", beehiiv: "marketing",
  algolia: "search", elastic: "data", meilisearch: "search", typesense: "search",
  adobe: "productivity", canva: "productivity", miro: "productivity", lucidchart: "productivity",
  loom: "productivity", coda: "productivity", evernote: "productivity", obsidian: "productivity",
  todoist: "productivity", height: "development", shortcut: "development", codacy: "development",
  sonarcloud: "development", launchdarkly: "development", statuspage: "development",
  botpress: "ai", voiceflow: "ai", langfuse: "ai", humanloop: "ai", braintrust: "ai",
  stability: "ai", runway: "ai", synthesia: "ai", descript: "ai", assemblyai: "ai",
  deepgram: "ai", whisper: "ai", "alpha-vantage": "finance", benzinga: "finance",
  polygon: "finance", quandl: "finance", wise: "finance", revolut: "finance", mercury: "finance",
  chargebee: "finance", recurly: "finance", paddle: "finance", lemonsqueezy: "commerce",
  gumroad: "commerce", bigcommerce: "commerce", magento: "commerce", squarespace: "commerce",
  wix: "commerce", printful: "commerce", faire: "commerce", "aftership": "commerce",
  workable: "hr", personio: "hr", hibob: "hr", remote: "hr", oysterhr: "hr", justworks: "hr",
  docebo: "hr", "15five": "hr", lattice: "hr", "culture-amp": "hr",
  guru: "support", helpjuice: "support", kustomer: "support", liveagent: "support",
  tidio: "support", drift: "marketing", qualified: "marketing", unbounce: "marketing",
  optimizely: "marketing", vwo: "marketing", braze: "marketing", iterable: "marketing",
  ably: "development", pusher: "development", twilio: "communication", vonage: "communication",
  bandwidth: "communication", plivo: "communication", messagebird: "communication",
  ringcentral: "communication", dialpad: "communication", aircall: "communication",
};

/** Keyword rules that group a service. First match wins; order matters. */
const CATEGORY_RULES = [
  ["security", ["auth", "security", "vault", "password", "sso", "identity", "compliance", "gdpr", "soc2", "firewall", "antivirus", "encrypt"]],
  ["development", ["git", "code", "repo", "deploy", "docker", "kubernetes", "jenkins", "circleci", "sentry", "bug", "jira", "linear", "bitbucket", "vercel", "netlify", "heroku", "supabase", "firebase", "api", "sdk", "devops", "terraform", "ansible", "gradle", "npm", "pypi"]],
  ["communication", ["slack", "chat", "mail", "gmail", "outlook", "discord", "telegram", "whatsapp", "sms", "twilio", "message", "teams", "zoom", "meet", "call", "voice", "inbox", "smtp", "imap"]],
  ["crm", ["crm", "salesforce", "hubspot", "pipedrive", "zoho", "close", "copper", "attio", "apollo", "lead", "prospect", "contact", "sales", "deal", "outreach", "salesloft"]],
  ["marketing", ["marketing", "campaign", "mailchimp", "klaviyo", "brevo", "convertkit", "ads", "seo", "ahrefs", "semrush", "social", "buffer", "hootsuite", "instagram", "facebook", "tiktok", "twitter", "linkedin", "reddit", "youtube", "pinterest"]],
  ["support", ["support", "zendesk", "intercom", "freshdesk", "helpdesk", "ticket", "desk", "front", "crisp", "gorgias", "helpscout"]],
  ["finance", ["stripe", "pay", "invoice", "billing", "quickbooks", "xero", "freshbooks", "accounting", "expense", "ramp", "brex", "plaid", "bank", "tax", "payroll", "gusto", "wise", "coinbase", "binance", "crypto"]],
  ["commerce", ["shop", "commerce", "store", "ebay", "etsy", "amazon", "product", "inventory", "order", "shipping", "shipstation", "square"]],
  ["hr", ["hr", "recruit", "hiring", "candidate", "applicant", "greenhouse", "lever", "ashby", "workday", "bamboo", "rippling", "deel", "employee", "onboard"]],
  ["data", ["data", "analytics", "warehouse", "snowflake", "bigquery", "sql", "database", "mongo", "redis", "elastic", "grafana", "metabase", "looker", "tableau", "mixpanel", "amplitude", "posthog", "segment", "airbyte", "fivetran"]],
  ["ai", ["ai", "gpt", "llm", "openai", "anthropic", "gemini", "perplexity", "mistral", "cohere", "huggingface", "vector", "pinecone", "weaviate", "qdrant", "chroma", "embed", "transcri", "speech", "voice", "image-gen", "stability", "replicate", "eleven"]],
  ["search", ["search", "scrape", "crawl", "serp", "exa", "tavily", "firecrawl", "browser", "apify", "brightdata", "proxy", "enrich", "clearbit", "hunter", "lusha", "snov"]],
  ["storage", ["drive", "dropbox", "box", "storage", "file", "s3", "bucket", "onedrive", "sharepoint", "upload", "cdn", "cloudinary"]],
  ["productivity", ["notion", "doc", "sheet", "note", "task", "todo", "project", "board", "trello", "asana", "monday", "clickup", "wrike", "smartsheet", "basecamp", "confluence", "wiki", "calendar", "schedul", "calendly", "meeting", "form", "survey", "sign", "pdf", "slide", "whiteboard", "miro", "figma", "canva", "design"]],
];

function slugify(file) {
  return basename(file, extname(file))
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-(logo|icon|svg-icon)$/g, "")
    .replace(/-round\d*-\d+$/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/-\d$/, "")
    .replace(/^-+|-+$/g, "");
}

function displayName(slug) {
  if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

function categorize(slug) {
  if (CATEGORY_OVERRIDES[slug]) return CATEGORY_OVERRIDES[slug];
  for (const [category, keywords] of CATEGORY_RULES) {
    if (keywords.some((keyword) => slug.includes(keyword))) return category;
  }
  return "other";
}

const files = readdirSync(SOURCE)
  .filter((file) => RASTER.has(extname(file).toLowerCase()))
  .filter((file) => statSync(join(SOURCE, file)).size < 2_000_000)
  .filter((file) => !EXCLUDED.has(slugify(file)));

// One entry per slug; prefer the smallest source file when a brand has several.
const bySlug = new Map();
for (const file of files) {
  const slug = slugify(file);
  if (!slug || slug.length < 2) continue;
  const size = statSync(join(SOURCE, file)).size;
  const current = bySlug.get(slug);
  if (!current || size < current.size) bySlug.set(slug, { file, size });
}

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const entries = [];
const skipped = [];

/**
 * Several files in the source set carry the wrong extension — SVG markup saved
 * as .png, an ICO wrapping a PNG. Sniff the bytes instead of trusting the name.
 */
/**
 * Cowind's surfaces are near-black, so a mark drawn in black disappears on them.
 *
 * The right measure here is brightness, not luminance: a saturated red mark has
 * low luminance but reads perfectly well against near-black, and putting it on a
 * white plate would be wrong. Brightness — the max channel — separates "dark
 * ink" from "strong colour", which is exactly the distinction that matters.
 */
async function isDarkMark(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let total = 0;
  let weight = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const alpha = data[i + 3] / 255;
    if (alpha < 0.35) continue;
    const brightness = Math.max(data[i], data[i + 1], data[i + 2]) / 255;
    total += brightness * alpha;
    weight += alpha;
  }
  if (weight === 0) return false;
  return total / weight < 0.34;
}

function normalise(buffer) {
  const head = buffer.subarray(0, 400).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return { kind: "svg", buffer };

  // ICO container: the largest entries usually embed a whole PNG.
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01) {
    const png = buffer.indexOf(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    if (png > 0) return { kind: "raster", buffer: buffer.subarray(png) };
  }
  return { kind: "raster", buffer };
}

for (const [slug, { file }] of [...bySlug.entries()].sort()) {
  const source = join(SOURCE, file);
  const { kind, buffer } = normalise(readFileSync(source));

  try {
    const rendered = await sharp(buffer, { density: 300 })
      .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp(rendered).webp({ quality: 88, effort: 6 }).toFile(join(OUT_DIR, `${slug}.webp`));
    entries.push({
      slug,
      name: displayName(slug),
      category: categorize(slug),
      ext: "webp",
      dark: await isDarkMark(rendered),
    });
  } catch {
    // Some SVGs use features the rasteriser refuses. They are already small and
    // scale perfectly, so pass them through untouched rather than dropping the
    // service from the catalogue.
    if (kind === "svg") {
      writeFileSync(join(OUT_DIR, `${slug}.svg`), buffer);
      // An unrasterisable SVG cannot be measured; assume it needs the plate,
      // which is the safe direction — a light plate never hides a mark.
      entries.push({ slug, name: displayName(slug), category: categorize(slug), ext: "svg", dark: true });
    } else {
      skipped.push(file);
    }
  }
}

const header = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/sync-integrations.mjs <path-to-open-logos>
// Source: ComposioHQ/open-logos (one file per toolkit).
// ${entries.length} services, logo assets in public/logos/<slug>.webp

export interface CatalogEntry {
  slug: string;
  name: string;
  category: string;
  /** Asset extension under /logos: "webp" for rasterised marks, "svg" for pass-through. */
  ext: "webp" | "svg";
  /** True when the mark is too dark to read on Cowind's surfaces unaided. */
  dark: boolean;
}

export const CATALOG: CatalogEntry[] = ${JSON.stringify(entries, null, 2)};
`;

writeFileSync(OUT_FILE, header);
console.log(`catalogued ${entries.length} services`);
if (skipped.length > 0) console.log(`skipped (unreadable): ${skipped.join(", ")}`);
