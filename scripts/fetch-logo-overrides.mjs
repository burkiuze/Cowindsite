/**
 * Vetted brand marks for the services people actually recognise.
 *
 * The bulk catalogue comes from Composio's logo set, which is generous but
 * uneven: a few files carry the wrong brand entirely (its `confluence-logo.png`
 * is the Shopify wordmark), and some marks are years out of date. For the
 * brands a visitor will spot immediately, this fetches the current mark from
 * homarr-labs/dashboard-icons — an actively maintained icon set — into
 * `assets/logo-overrides`, which the catalogue generator prefers over the bulk
 * source.
 *
 * Only names that exist in BOTH sets are fetched: this corrects and refreshes
 * the catalogue, it never invents a service.
 *
 *   node scripts/fetch-logo-overrides.mjs
 *   node scripts/sync-integrations.mjs /path/to/open-logos
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TREE = "https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/tree.json";
const RAW = "https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/svg";
const OUT_DIR = "assets/logo-overrides";
const CATALOG = "src/lib/workspace/catalog.generated.ts";

const tree = await (await fetch(TREE)).json();
const available = new Set(tree.svg.map((name) => name.replace(/\.svg$/, "")));

/** Catalogue slugs whose mark lives under a different name upstream. */
const ALIASES = { twitter: "x" };

const slugs = [...readFileSync(CATALOG, "utf8").matchAll(/"slug": "([^"]+)"/g)].map((match) => match[1]);
const wanted = slugs
  .map((slug) => ({ slug, source: ALIASES[slug] ?? slug }))
  .filter(({ source }) => available.has(source));

mkdirSync(OUT_DIR, { recursive: true });
let written = 0;
for (const { slug, source } of wanted) {
  const response = await fetch(`${RAW}/${source}.svg`);
  if (!response.ok) {
    console.warn(`skipped ${slug}: HTTP ${response.status}`);
    continue;
  }
  writeFileSync(join(OUT_DIR, `${slug}.svg`), await response.text());
  written += 1;
}

console.log(`wrote ${written} marks to ${OUT_DIR} (of ${slugs.length} catalogue entries)`);
