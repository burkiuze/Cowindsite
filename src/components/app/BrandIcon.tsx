import * as simpleIcons from "simple-icons";

type SimpleIcon = { path: string; hex: string; title: string };

/**
 * Brand marks for the integrations gallery.
 *
 * Rendered from the icon package's path data at build time, monochrome by
 * default so the gallery stays calm, and tinted with the brand's own colour on
 * hover. Services without a mark fall back to a lettered tile.
 */
const SLUG: Partial<Record<string, keyof typeof simpleIcons>> = {
  github: "siGithub",
  gitlab: "siGitlab",
  linear: "siLinear",
  jira: "siJira",
  figma: "siFigma",
  supabase: "siSupabase",
  discord: "siDiscord",
  gmail: "siGmail",
  intercom: "siIntercom",
  zendesk: "siZendesk",
  "google-calendar": "siGooglecalendar",
  "google-docs": "siGoogledocs",
  "google-sheets": "siGooglesheets",
  notion: "siNotion",
  trello: "siTrello",
  asana: "siAsana",
  "google-drive": "siGoogledrive",
  dropbox: "siDropbox",
  hubspot: "siHubspot",
  stripe: "siStripe",
  shopify: "siShopify",
  airtable: "siAirtable",
};

/**
 * Services whose marks the icon package does not carry (several vendors ask not
 * to be redistributed) fall back to a lettered tile rather than a wrong logo.
 */
const LETTERED = new Set(["microsoft-teams", "outlook", "onedrive", "slack", "salesforce"]);

export function BrandIcon({ id, name, size = 20 }: { id: string; name: string; size?: number }) {
  const key = SLUG[id];
  const icon = !LETTERED.has(id) && key ? (simpleIcons[key] as unknown as SimpleIcon | undefined) : undefined;

  if (!icon) {
    return (
      <span
        className="flex items-center justify-center rounded-md border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[11px] font-semibold text-[var(--color-ink-muted)]"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="text-[var(--color-ink-muted)] transition-colors group-hover:text-(--brand)"
      style={{ "--brand": `#${icon.hex}` } as React.CSSProperties}
    >
      <path d={icon.path} />
    </svg>
  );
}
