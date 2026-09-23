// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/sync-integrations.mjs <path-to-open-logos>
// Source: ComposioHQ/open-logos (one file per toolkit), with vetted marks for
// well-known brands from homarr-labs/dashboard-icons (assets/logo-overrides)
// and owner-chosen marks from assets/logo-supplied.
// 764 services, logo assets in public/logos/<slug>-<hash>.webp

export interface CatalogEntry {
  slug: string;
  name: string;
  category: string;
  /**
   * Asset filename under /logos, carrying a hash of the image itself, or null
   * when no trustworthy mark exists and the interface should fall back to a
   * lettered tile. The hash is what lets a corrected mark actually reach a
   * browser that already cached the old one.
   */
  file: string | null;
  /** True when the mark is too dark to read on Navio's surfaces unaided. */
  dark: boolean;
  /**
   * The source mark was the brand's name set in type with no icon to cut out:
   * far too wide to read in a small square. `file` is then a lettered tile
   * in `tint`, generated here, rather than a smudge of shrunken letters.
   */
  wordmark?: boolean;
  /** The brand's strongest colour, measured from its own artwork. */
  tint?: string | null;
}

export const CATALOG: CatalogEntry[] = [
  {
    "slug": "21risk",
    "name": "21risk",
    "category": "other",
    "file": "21risk-8535a66f.webp",
    "dark": true
  },
  {
    "slug": "2chat",
    "name": "2chat",
    "category": "communication",
    "file": null,
    "dark": false
  },
  {
    "slug": "ably",
    "name": "Ably",
    "category": "development",
    "file": "ably-1b088bec.webp",
    "dark": false
  },
  {
    "slug": "abstract",
    "name": "Abstract",
    "category": "other",
    "file": "abstract-3d85ee0c.webp",
    "dark": true
  },
  {
    "slug": "abyssale",
    "name": "Abyssale",
    "category": "other",
    "file": "abyssale-7c50a29b.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#68ffad"
  },
  {
    "slug": "accelo",
    "name": "Accelo",
    "category": "other",
    "file": "accelo-ec23186d.webp",
    "dark": false
  },
  {
    "slug": "accredible-certificates",
    "name": "Accredible Certificates",
    "category": "other",
    "file": "accredible-certificates-4419e7bb.webp",
    "dark": false
  },
  {
    "slug": "acculynx",
    "name": "Acculynx",
    "category": "other",
    "file": "acculynx-53f2149a.webp",
    "dark": true
  },
  {
    "slug": "activecampaign",
    "name": "ActiveCampaign",
    "category": "marketing",
    "file": "activecampaign-5ddfd8b2.webp",
    "dark": false
  },
  {
    "slug": "addresszen",
    "name": "Addresszen",
    "category": "other",
    "file": "addresszen-696ffedb.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "adobe",
    "name": "Adobe",
    "category": "productivity",
    "file": "adobe-7ee687fa.webp",
    "dark": false
  },
  {
    "slug": "adrapid",
    "name": "Adrapid",
    "category": "development",
    "file": "adrapid-8ca36ac0.webp",
    "dark": true
  },
  {
    "slug": "adyntel",
    "name": "Adyntel",
    "category": "other",
    "file": "adyntel-d17584b2.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#b2ff49"
  },
  {
    "slug": "aero-workflow",
    "name": "Aero Workflow",
    "category": "other",
    "file": "aero-workflow-e726bad8.webp",
    "dark": false
  },
  {
    "slug": "aeroleads",
    "name": "Aeroleads",
    "category": "crm",
    "file": "aeroleads-154fa8f5.webp",
    "dark": false
  },
  {
    "slug": "affinda",
    "name": "Affinda",
    "category": "other",
    "file": "affinda-7202d073.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0096ff"
  },
  {
    "slug": "affinity",
    "name": "Affinity",
    "category": "other",
    "file": "affinity-c1117fd3.webp",
    "dark": false
  },
  {
    "slug": "agencyzoom",
    "name": "Agencyzoom",
    "category": "communication",
    "file": "agencyzoom-091852c9.webp",
    "dark": false
  },
  {
    "slug": "agentql",
    "name": "Agentql",
    "category": "other",
    "file": "agentql-dfe6390b.webp",
    "dark": true
  },
  {
    "slug": "agenty",
    "name": "Agenty",
    "category": "other",
    "file": "agenty-9adeef19.webp",
    "dark": true
  },
  {
    "slug": "agiled",
    "name": "Agiled",
    "category": "other",
    "file": "agiled-8ac929c5.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0062ff"
  },
  {
    "slug": "agility-cms",
    "name": "Agility Cms",
    "category": "other",
    "file": "agility-cms-126680e9.webp",
    "dark": false
  },
  {
    "slug": "ahrefs",
    "name": "Ahrefs",
    "category": "marketing",
    "file": "ahrefs-9680aa09.webp",
    "dark": false
  },
  {
    "slug": "ai-ml-api",
    "name": "AI ML Api",
    "category": "development",
    "file": null,
    "dark": false
  },
  {
    "slug": "airtable",
    "name": "Airtable",
    "category": "ai",
    "file": "airtable-ae417881.webp",
    "dark": false
  },
  {
    "slug": "aivoov",
    "name": "Aivoov",
    "category": "ai",
    "file": "aivoov-b3357a74.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0d64a6"
  },
  {
    "slug": "alchemy",
    "name": "Alchemy",
    "category": "other",
    "file": "alchemy-aecbc613.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#363ff9"
  },
  {
    "slug": "algodocs",
    "name": "Algodocs",
    "category": "productivity",
    "file": "algodocs-696ffedb.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "algolia",
    "name": "Algolia",
    "category": "search",
    "file": "algolia-e23e00d8.webp",
    "dark": false
  },
  {
    "slug": "all-images-ai",
    "name": "All Images AI",
    "category": "ai",
    "file": "all-images-ai-b695e385.webp",
    "dark": false
  },
  {
    "slug": "alpha-vantage",
    "name": "Alpha Vantage",
    "category": "finance",
    "file": "alpha-vantage-22079190.webp",
    "dark": false
  },
  {
    "slug": "altoviz",
    "name": "Altoviz",
    "category": "other",
    "file": "altoviz-6ad1a315.webp",
    "dark": false
  },
  {
    "slug": "alttext-ai",
    "name": "Alttext AI",
    "category": "ai",
    "file": "alttext-ai-29e18ec7.webp",
    "dark": false
  },
  {
    "slug": "am-cards",
    "name": "AM Cards",
    "category": "other",
    "file": "am-cards-5cac87a0.webp",
    "dark": false
  },
  {
    "slug": "amara",
    "name": "Amara",
    "category": "other",
    "file": "amara-4345dc6a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#5a2747"
  },
  {
    "slug": "amazon",
    "name": "Amazon",
    "category": "commerce",
    "file": "amazon-a74d7668.webp",
    "dark": true
  },
  {
    "slug": "ambee",
    "name": "Ambee",
    "category": "other",
    "file": "ambee-239ce6ca.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#96d4eb"
  },
  {
    "slug": "amcards",
    "name": "Amcards",
    "category": "other",
    "file": "amcards-82887161.webp",
    "dark": false
  },
  {
    "slug": "amplitude",
    "name": "Amplitude",
    "category": "data",
    "file": "amplitude-53cde2cb.webp",
    "dark": false
  },
  {
    "slug": "anchor-browser",
    "name": "Anchor Browser",
    "category": "search",
    "file": "anchor-browser-eb7697b8.webp",
    "dark": true
  },
  {
    "slug": "anonyflow",
    "name": "Anonyflow",
    "category": "other",
    "file": "anonyflow-8a745e4c.webp",
    "dark": false
  },
  {
    "slug": "apaleo",
    "name": "Apaleo",
    "category": "other",
    "file": "apaleo-f00ebbd8.webp",
    "dark": true
  },
  {
    "slug": "apex-27",
    "name": "Apex 27",
    "category": "other",
    "file": "apex-27-696ffedb.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "api-bible",
    "name": "Api Bible",
    "category": "development",
    "file": "api-bible-e5fd6aaf.webp",
    "dark": false
  },
  {
    "slug": "api-labz",
    "name": "Api Labz",
    "category": "development",
    "file": "api-labz-1013a47e.webp",
    "dark": false
  },
  {
    "slug": "api-ninjas",
    "name": "Api Ninjas",
    "category": "development",
    "file": "api-ninjas-6290175c.webp",
    "dark": false
  },
  {
    "slug": "api-sports",
    "name": "Api Sports",
    "category": "development",
    "file": "api-sports-d43d4124.webp",
    "dark": false
  },
  {
    "slug": "api2pdf",
    "name": "Api2pdf",
    "category": "development",
    "file": "api2pdf-ba9714e2.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#1ea7d7"
  },
  {
    "slug": "apify",
    "name": "Apify",
    "category": "development",
    "file": "apify-9f887d3d.webp",
    "dark": true
  },
  {
    "slug": "apilio",
    "name": "Apilio",
    "category": "development",
    "file": "apilio-fbbd9557.webp",
    "dark": true
  },
  {
    "slug": "apipie-ai",
    "name": "Apipie AI",
    "category": "development",
    "file": "apipie-ai-040f35e3.webp",
    "dark": false
  },
  {
    "slug": "apitemplate-io",
    "name": "Apitemplate IO",
    "category": "development",
    "file": "apitemplate-io-6b7f859d.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#8ec7f5"
  },
  {
    "slug": "apiverve",
    "name": "Apiverve",
    "category": "development",
    "file": "apiverve-af6442b2.webp",
    "dark": false
  },
  {
    "slug": "apollo",
    "name": "Apollo",
    "category": "crm",
    "file": "apollo-aff6a1b7.webp",
    "dark": false
  },
  {
    "slug": "appcircle",
    "name": "Appcircle",
    "category": "other",
    "file": "appcircle-0591c965.webp",
    "dark": false
  },
  {
    "slug": "appdrag",
    "name": "Appdrag",
    "category": "other",
    "file": "appdrag-cf793a18.webp",
    "dark": false
  },
  {
    "slug": "appointo",
    "name": "Appointo",
    "category": "other",
    "file": "appointo-c418456a.webp",
    "dark": false
  },
  {
    "slug": "appsflyer",
    "name": "Appsflyer",
    "category": "other",
    "file": "appsflyer-de28ae3c.webp",
    "dark": false
  },
  {
    "slug": "appveyor",
    "name": "Appveyor",
    "category": "other",
    "file": "appveyor-cc0c7203.webp",
    "dark": false
  },
  {
    "slug": "aryn",
    "name": "Aryn",
    "category": "other",
    "file": "aryn-664cfa23.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#417586"
  },
  {
    "slug": "asana",
    "name": "Asana",
    "category": "productivity",
    "file": "asana-03aa3405.webp",
    "dark": false
  },
  {
    "slug": "ascora",
    "name": "Ascora",
    "category": "other",
    "file": "ascora-6b6b65fc.webp",
    "dark": false
  },
  {
    "slug": "ashby",
    "name": "Ashby",
    "category": "hr",
    "file": "ashby-497bc90f.webp",
    "dark": false
  },
  {
    "slug": "astica-ai",
    "name": "Astica AI",
    "category": "ai",
    "file": "astica-ai-db3fe8fb.webp",
    "dark": false
  },
  {
    "slug": "async-interview",
    "name": "Async Interview",
    "category": "other",
    "file": "async-interview-6e2210c5.webp",
    "dark": false
  },
  {
    "slug": "atlassian",
    "name": "Atlassian",
    "category": "development",
    "file": "atlassian-fec6aa4e.webp",
    "dark": false
  },
  {
    "slug": "attio",
    "name": "Attio",
    "category": "crm",
    "file": "attio-598f94ff.webp",
    "dark": false
  },
  {
    "slug": "auth0",
    "name": "Auth0",
    "category": "security",
    "file": "auth0-6e0c6451.webp",
    "dark": false
  },
  {
    "slug": "autobound",
    "name": "Autobound",
    "category": "other",
    "file": "autobound-1eb1947e.webp",
    "dark": false
  },
  {
    "slug": "axonaut",
    "name": "Axonaut",
    "category": "other",
    "file": "axonaut-1f725a88.webp",
    "dark": false
  },
  {
    "slug": "ayrshare",
    "name": "Ayrshare",
    "category": "other",
    "file": "ayrshare-85cc5cdf.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#be2327"
  },
  {
    "slug": "backendless",
    "name": "Backendless",
    "category": "other",
    "file": "backendless-8425baf2.webp",
    "dark": true
  },
  {
    "slug": "bamboohr",
    "name": "BambooHR",
    "category": "hr",
    "file": "bamboohr-3721559d.webp",
    "dark": false
  },
  {
    "slug": "bannerbear",
    "name": "Bannerbear",
    "category": "other",
    "file": "bannerbear-006bef43.webp",
    "dark": false
  },
  {
    "slug": "bart",
    "name": "Bart",
    "category": "other",
    "file": "bart-ce4f72d8.webp",
    "dark": false
  },
  {
    "slug": "baselinker",
    "name": "Baselinker",
    "category": "other",
    "file": "baselinker-2803157d.webp",
    "dark": false
  },
  {
    "slug": "baserow",
    "name": "Baserow",
    "category": "other",
    "file": "baserow-a8a089c2.webp",
    "dark": false
  },
  {
    "slug": "basin",
    "name": "Basin",
    "category": "other",
    "file": "basin-c5b20d8e.webp",
    "dark": false
  },
  {
    "slug": "battlenet",
    "name": "Battlenet",
    "category": "other",
    "file": "battlenet-67a0e843.webp",
    "dark": false
  },
  {
    "slug": "beaconchain",
    "name": "Beaconchain",
    "category": "ai",
    "file": "beaconchain-9c1a7f25.webp",
    "dark": false
  },
  {
    "slug": "beaconstac",
    "name": "Beaconstac",
    "category": "other",
    "file": "beaconstac-cf0da04e.webp",
    "dark": true
  },
  {
    "slug": "beamer",
    "name": "Beamer",
    "category": "other",
    "file": "beamer-bf89971a.webp",
    "dark": true
  },
  {
    "slug": "beeminder",
    "name": "Beeminder",
    "category": "other",
    "file": "beeminder-17a1d9e7.webp",
    "dark": false
  },
  {
    "slug": "benchmark-email",
    "name": "Benchmark Email",
    "category": "communication",
    "file": "benchmark-email-c9e917c9.webp",
    "dark": false
  },
  {
    "slug": "benzinga",
    "name": "Benzinga",
    "category": "finance",
    "file": "benzinga-2272a459.webp",
    "dark": false
  },
  {
    "slug": "better-proposals",
    "name": "Better Proposals",
    "category": "other",
    "file": "better-proposals-a15ac834.webp",
    "dark": false
  },
  {
    "slug": "better-stack",
    "name": "Better Stack",
    "category": "other",
    "file": "better-stack-96755218.webp",
    "dark": false
  },
  {
    "slug": "bidsketch",
    "name": "Bidsketch",
    "category": "other",
    "file": "bidsketch-1705e482.webp",
    "dark": false
  },
  {
    "slug": "big-data-cloud",
    "name": "Big Data Cloud",
    "category": "data",
    "file": "big-data-cloud-337740e6.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "bigmailer",
    "name": "Bigmailer",
    "category": "communication",
    "file": "bigmailer-9f0cf10e.webp",
    "dark": false
  },
  {
    "slug": "bigml",
    "name": "Bigml",
    "category": "other",
    "file": "bigml-253d23e1.webp",
    "dark": false
  },
  {
    "slug": "bigpicture-io",
    "name": "Bigpicture IO",
    "category": "other",
    "file": "bigpicture-io-1c41727b.webp",
    "dark": false
  },
  {
    "slug": "bigquery",
    "name": "BigQuery",
    "category": "data",
    "file": "bigquery-86279e83.webp",
    "dark": false
  },
  {
    "slug": "bill",
    "name": "Bill",
    "category": "other",
    "file": "bill-7a2103b2.webp",
    "dark": false
  },
  {
    "slug": "binance",
    "name": "Binance",
    "category": "finance",
    "file": "binance-ecdb46f5.webp",
    "dark": true
  },
  {
    "slug": "bitbucket",
    "name": "Bitbucket",
    "category": "development",
    "file": "bitbucket-94cd3b9d.webp",
    "dark": false
  },
  {
    "slug": "bitquery",
    "name": "Bitquery",
    "category": "other",
    "file": "bitquery-ab23aba6.webp",
    "dark": false
  },
  {
    "slug": "bitwarden",
    "name": "Bitwarden",
    "category": "security",
    "file": "bitwarden-0a9ab7d9.webp",
    "dark": false
  },
  {
    "slug": "blackbaud",
    "name": "Blackbaud",
    "category": "other",
    "file": "blackbaud-39a2199f.webp",
    "dark": false
  },
  {
    "slug": "blackboard",
    "name": "Blackboard",
    "category": "productivity",
    "file": "blackboard-01ba6e0f.webp",
    "dark": true
  },
  {
    "slug": "blazemeter",
    "name": "Blazemeter",
    "category": "other",
    "file": "blazemeter-b51e123a.webp",
    "dark": false
  },
  {
    "slug": "blocknative",
    "name": "Blocknative",
    "category": "other",
    "file": "blocknative-fe9adbc9.webp",
    "dark": false
  },
  {
    "slug": "boldsign",
    "name": "Boldsign",
    "category": "productivity",
    "file": "boldsign-fd8d7cbf.webp",
    "dark": false
  },
  {
    "slug": "bolna",
    "name": "Bolna",
    "category": "other",
    "file": "bolna-ee3c9254.webp",
    "dark": false
  },
  {
    "slug": "boloforms",
    "name": "Boloforms",
    "category": "productivity",
    "file": "boloforms-8e42c632.webp",
    "dark": false
  },
  {
    "slug": "bolt-iot",
    "name": "Bolt Iot",
    "category": "other",
    "file": "bolt-iot-67f3dba4.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#9bdf46"
  },
  {
    "slug": "bookingmood",
    "name": "Bookingmood",
    "category": "other",
    "file": "bookingmood-836803a0.webp",
    "dark": false
  },
  {
    "slug": "booqable",
    "name": "Booqable",
    "category": "other",
    "file": "booqable-337740e6.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "borneo",
    "name": "Borneo",
    "category": "other",
    "file": "borneo-7565727a.webp",
    "dark": false
  },
  {
    "slug": "botbaba",
    "name": "Botbaba",
    "category": "other",
    "file": "botbaba-ac4c4a81.webp",
    "dark": false
  },
  {
    "slug": "botpress",
    "name": "Botpress",
    "category": "ai",
    "file": "botpress-337740e6.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "botsonic",
    "name": "Botsonic",
    "category": "other",
    "file": "botsonic-013372c9.webp",
    "dark": false
  },
  {
    "slug": "botstar",
    "name": "Botstar",
    "category": "other",
    "file": "botstar-8380d325.webp",
    "dark": false
  },
  {
    "slug": "bouncer",
    "name": "Bouncer",
    "category": "other",
    "file": "bouncer-ede7efb4.webp",
    "dark": false
  },
  {
    "slug": "box",
    "name": "Box",
    "category": "storage",
    "file": "box-4f98f515.webp",
    "dark": false
  },
  {
    "slug": "boxhero",
    "name": "Boxhero",
    "category": "storage",
    "file": "boxhero-d3cdb284.webp",
    "dark": false
  },
  {
    "slug": "braintree",
    "name": "Braintree",
    "category": "ai",
    "file": "braintree-9f94409b.webp",
    "dark": false
  },
  {
    "slug": "brandfetch",
    "name": "Brandfetch",
    "category": "other",
    "file": "brandfetch-f9caaebf.webp",
    "dark": false
  },
  {
    "slug": "breezyhr",
    "name": "Breezyhr",
    "category": "hr",
    "file": "breezyhr-9af6465d.webp",
    "dark": false
  },
  {
    "slug": "brevo",
    "name": "Brevo",
    "category": "marketing",
    "file": "brevo-8f4168d4.webp",
    "dark": false
  },
  {
    "slug": "brex-staging",
    "name": "Brex Staging",
    "category": "finance",
    "file": "brex-staging-9012ddee.webp",
    "dark": true
  },
  {
    "slug": "brightpearl",
    "name": "Brightpearl",
    "category": "other",
    "file": "brightpearl-7467cfe8.webp",
    "dark": false
  },
  {
    "slug": "browseai",
    "name": "Browseai",
    "category": "ai",
    "file": "browseai-8ba6d5e3.webp",
    "dark": false
  },
  {
    "slug": "browser-base",
    "name": "Browser Base",
    "category": "search",
    "file": "browser-base-02203345.webp",
    "dark": false
  },
  {
    "slug": "browserhub",
    "name": "Browserhub",
    "category": "search",
    "file": "browserhub-d49d1538.webp",
    "dark": false
  },
  {
    "slug": "browserless",
    "name": "Browserless",
    "category": "search",
    "file": "browserless-04fd6553.webp",
    "dark": true
  },
  {
    "slug": "btcpay-server",
    "name": "Btcpay Server",
    "category": "finance",
    "file": "btcpay-server-5db1b511.webp",
    "dark": false
  },
  {
    "slug": "bubble",
    "name": "Bubble",
    "category": "other",
    "file": "bubble-75635fef.webp",
    "dark": false
  },
  {
    "slug": "bugbug",
    "name": "Bugbug",
    "category": "development",
    "file": "bugbug-a8ec9326.webp",
    "dark": false
  },
  {
    "slug": "bugherd",
    "name": "Bugherd",
    "category": "development",
    "file": "bugherd-6f256e4c.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#86bad3"
  },
  {
    "slug": "buildkite",
    "name": "Buildkite",
    "category": "other",
    "file": "buildkite-6e959059.webp",
    "dark": true
  },
  {
    "slug": "builtwith",
    "name": "Builtwith",
    "category": "other",
    "file": "builtwith-302cc109.webp",
    "dark": false
  },
  {
    "slug": "bunnycdn",
    "name": "Bunnycdn",
    "category": "storage",
    "file": "bunnycdn-5d0b34ca.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#f36e24"
  },
  {
    "slug": "byteforms",
    "name": "Byteforms",
    "category": "productivity",
    "file": "byteforms-fee844e7.webp",
    "dark": false
  },
  {
    "slug": "cabinpanda",
    "name": "Cabinpanda",
    "category": "other",
    "file": "cabinpanda-9d01d842.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "cal",
    "name": "Cal",
    "category": "other",
    "file": "cal-51cec734.webp",
    "dark": true
  },
  {
    "slug": "calendarhero",
    "name": "Calendarhero",
    "category": "productivity",
    "file": "calendarhero-063594ce.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#f7cd56"
  },
  {
    "slug": "calendly",
    "name": "Calendly",
    "category": "productivity",
    "file": "calendly-4e0cfe82.webp",
    "dark": false
  },
  {
    "slug": "callingly",
    "name": "Callingly",
    "category": "communication",
    "file": "callingly-4112d76b.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#033b4c"
  },
  {
    "slug": "callpage",
    "name": "Callpage",
    "category": "communication",
    "file": null,
    "dark": false
  },
  {
    "slug": "campaign-cleaner",
    "name": "Campaign Cleaner",
    "category": "marketing",
    "file": "campaign-cleaner-9d01d842.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "campayn",
    "name": "Campayn",
    "category": "finance",
    "file": "campayn-e915dad9.webp",
    "dark": false
  },
  {
    "slug": "canny",
    "name": "Canny",
    "category": "other",
    "file": "canny-ce4a3ec1.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#525df9"
  },
  {
    "slug": "canva",
    "name": "Canva",
    "category": "productivity",
    "file": "canva-92d7f600.webp",
    "dark": false
  },
  {
    "slug": "canvas",
    "name": "Canvas",
    "category": "productivity",
    "file": "canvas-17e35fa3.webp",
    "dark": false
  },
  {
    "slug": "capsule-crm",
    "name": "Capsule Crm",
    "category": "crm",
    "file": "capsule-crm-76bdfde5.webp",
    "dark": false
  },
  {
    "slug": "carbone",
    "name": "Carbone",
    "category": "other",
    "file": "carbone-96c9c455.webp",
    "dark": false
  },
  {
    "slug": "cardly",
    "name": "Cardly",
    "category": "other",
    "file": "cardly-ce18ad5f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#6bd9de"
  },
  {
    "slug": "cats",
    "name": "Cats",
    "category": "other",
    "file": "cats-899bc1ae.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ff6841"
  },
  {
    "slug": "census-bureau",
    "name": "Census Bureau",
    "category": "other",
    "file": "census-bureau-9d01d842.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "centralstationcrm",
    "name": "Centralstationcrm",
    "category": "crm",
    "file": "centralstationcrm-1b2d0774.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#363e64"
  },
  {
    "slug": "certifier",
    "name": "Certifier",
    "category": "other",
    "file": "certifier-16da641b.webp",
    "dark": false
  },
  {
    "slug": "chatfai",
    "name": "Chatfai",
    "category": "communication",
    "file": "chatfai-155d68d2.webp",
    "dark": true
  },
  {
    "slug": "chatwork",
    "name": "Chatwork",
    "category": "communication",
    "file": "chatwork-c187475c.webp",
    "dark": false
  },
  {
    "slug": "chmeeting",
    "name": "Chmeeting",
    "category": "communication",
    "file": "chmeeting-9b2d4445.webp",
    "dark": false
  },
  {
    "slug": "chmeetings",
    "name": "Chmeetings",
    "category": "communication",
    "file": "chmeetings-1e69ec40.webp",
    "dark": false
  },
  {
    "slug": "cincopa",
    "name": "Cincopa",
    "category": "other",
    "file": "cincopa-e595135c.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0076ba"
  },
  {
    "slug": "circleci",
    "name": "Circleci",
    "category": "development",
    "file": "circleci-dae54a1d.svg",
    "dark": true
  },
  {
    "slug": "classroom",
    "name": "Classroom",
    "category": "other",
    "file": "classroom-d9759c79.webp",
    "dark": false
  },
  {
    "slug": "clickhouse",
    "name": "Clickhouse",
    "category": "other",
    "file": "clickhouse-f9b017c1.webp",
    "dark": false
  },
  {
    "slug": "clickmeeting",
    "name": "Clickmeeting",
    "category": "communication",
    "file": "clickmeeting-021e869f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#6ebe3b"
  },
  {
    "slug": "clickup",
    "name": "ClickUp",
    "category": "productivity",
    "file": "clickup-a4364570.svg",
    "dark": true
  },
  {
    "slug": "close",
    "name": "Close",
    "category": "crm",
    "file": "close-de29f5b6.webp",
    "dark": false
  },
  {
    "slug": "cloudcart",
    "name": "Cloudcart",
    "category": "other",
    "file": "cloudcart-f3f10c28.webp",
    "dark": false
  },
  {
    "slug": "cloudflare",
    "name": "Cloudflare",
    "category": "development",
    "file": "cloudflare-ee0ade6c.webp",
    "dark": false
  },
  {
    "slug": "cloudinary",
    "name": "Cloudinary",
    "category": "storage",
    "file": "cloudinary-042589b1.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#3448c5"
  },
  {
    "slug": "cloudlayer",
    "name": "Cloudlayer",
    "category": "other",
    "file": "cloudlayer-e0c29007.webp",
    "dark": false
  },
  {
    "slug": "cloudpress",
    "name": "Cloudpress",
    "category": "other",
    "file": "cloudpress-9d01d842.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "coda",
    "name": "Coda",
    "category": "productivity",
    "file": "coda-436aa442.webp",
    "dark": false
  },
  {
    "slug": "codacy",
    "name": "Codacy",
    "category": "development",
    "file": "codacy-7b07d135.webp",
    "dark": false
  },
  {
    "slug": "code-interpreter",
    "name": "Code Interpreter",
    "category": "development",
    "file": "code-interpreter-6f5d6db5.webp",
    "dark": false
  },
  {
    "slug": "coinbase",
    "name": "Coinbase",
    "category": "finance",
    "file": "coinbase-dda77f16.webp",
    "dark": false
  },
  {
    "slug": "coinmarketcal",
    "name": "Coinmarketcal",
    "category": "other",
    "file": "coinmarketcal-e9039d7e.webp",
    "dark": false
  },
  {
    "slug": "confluence",
    "name": "Confluence",
    "category": "productivity",
    "file": "confluence-fd24725a.webp",
    "dark": false
  },
  {
    "slug": "connecteam",
    "name": "Connecteam",
    "category": "other",
    "file": "connecteam-5eb86bf1.webp",
    "dark": false
  },
  {
    "slug": "contentful",
    "name": "Contentful",
    "category": "development",
    "file": "contentful-05566e91.webp",
    "dark": false
  },
  {
    "slug": "contentful-graphql",
    "name": "Contentful Graphql",
    "category": "other",
    "file": "contentful-graphql-ff9321bb.svg",
    "dark": true
  },
  {
    "slug": "convertapi",
    "name": "Convertapi",
    "category": "development",
    "file": "convertapi-47c55a8f.webp",
    "dark": false
  },
  {
    "slug": "convolo-ai",
    "name": "Convolo AI",
    "category": "ai",
    "file": "convolo-ai-0eba459a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0074ff"
  },
  {
    "slug": "crustdata",
    "name": "Crustdata",
    "category": "data",
    "file": "crustdata-6e23f3fd.webp",
    "dark": true
  },
  {
    "slug": "curated",
    "name": "Curated",
    "category": "other",
    "file": "curated-f67a5c2b.webp",
    "dark": false
  },
  {
    "slug": "currencyapi",
    "name": "Currencyapi",
    "category": "development",
    "file": "currencyapi-e07ea337.webp",
    "dark": false
  },
  {
    "slug": "customerio",
    "name": "Customerio",
    "category": "other",
    "file": "customerio-46e168e9.webp",
    "dark": false
  },
  {
    "slug": "cutt-ly",
    "name": "Cutt LY",
    "category": "other",
    "file": "cutt-ly-f7d631e6.webp",
    "dark": false
  },
  {
    "slug": "d2lbrightspace",
    "name": "D2lbrightspace",
    "category": "other",
    "file": "d2lbrightspace-669db82b.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ff832f"
  },
  {
    "slug": "daffy",
    "name": "Daffy",
    "category": "other",
    "file": "daffy-f8d9e11e.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "dailybot",
    "name": "Dailybot",
    "category": "ai",
    "file": "dailybot-c5402689.webp",
    "dark": false
  },
  {
    "slug": "datadog",
    "name": "Datadog",
    "category": "data",
    "file": "datadog-1a93faf7.webp",
    "dark": false
  },
  {
    "slug": "datagma",
    "name": "Datagma",
    "category": "data",
    "file": "datagma-beb4e4cd.webp",
    "dark": false
  },
  {
    "slug": "datarobot",
    "name": "Datarobot",
    "category": "data",
    "file": "datarobot-ceda0b29.webp",
    "dark": false
  },
  {
    "slug": "deadline-funnel",
    "name": "Deadline Funnel",
    "category": "other",
    "file": "deadline-funnel-f8d9e11e.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "deel",
    "name": "Deel",
    "category": "hr",
    "file": "deel-032bba36.webp",
    "dark": false
  },
  {
    "slug": "deepgram",
    "name": "Deepgram",
    "category": "ai",
    "file": "deepgram-f8d9e11e.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "demio",
    "name": "Demio",
    "category": "other",
    "file": "demio-8660e653.webp",
    "dark": false
  },
  {
    "slug": "detrack",
    "name": "Detrack",
    "category": "other",
    "file": "detrack-acb80004.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ec1f27"
  },
  {
    "slug": "dialpad",
    "name": "Dialpad",
    "category": "communication",
    "file": "dialpad-7472f37b.webp",
    "dark": false
  },
  {
    "slug": "diffbot",
    "name": "Diffbot",
    "category": "other",
    "file": "diffbot-24724b74.webp",
    "dark": false
  },
  {
    "slug": "digicert",
    "name": "Digicert",
    "category": "other",
    "file": "digicert-733be7d0.webp",
    "dark": false
  },
  {
    "slug": "digital-ocean",
    "name": "Digital Ocean",
    "category": "development",
    "file": "digital-ocean-ef462ca6.webp",
    "dark": false
  },
  {
    "slug": "discord",
    "name": "Discord",
    "category": "communication",
    "file": "discord-57fbb545.webp",
    "dark": false
  },
  {
    "slug": "docmosis",
    "name": "Docmosis",
    "category": "productivity",
    "file": "docmosis-0d47f760.webp",
    "dark": false
  },
  {
    "slug": "docsbot-ai",
    "name": "Docsbot AI",
    "category": "ai",
    "file": "docsbot-ai-513e115f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#11afa9"
  },
  {
    "slug": "docsumo",
    "name": "Docsumo",
    "category": "productivity",
    "file": "docsumo-28f60e26.webp",
    "dark": true
  },
  {
    "slug": "documint",
    "name": "Documint",
    "category": "productivity",
    "file": null,
    "dark": false
  },
  {
    "slug": "docupilot",
    "name": "Docupilot",
    "category": "productivity",
    "file": "docupilot-f1be5014.webp",
    "dark": false
  },
  {
    "slug": "docupost",
    "name": "Docupost",
    "category": "productivity",
    "file": "docupost-2753bd5b.webp",
    "dark": false
  },
  {
    "slug": "docusign",
    "name": "DocuSign",
    "category": "productivity",
    "file": "docusign-161e4833.webp",
    "dark": false
  },
  {
    "slug": "doppler-marketing-automation",
    "name": "Doppler Marketing Automation",
    "category": "marketing",
    "file": "doppler-marketing-automation-9dd16ed0.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#fab221"
  },
  {
    "slug": "dpd2",
    "name": "Dpd2",
    "category": "other",
    "file": null,
    "dark": false
  },
  {
    "slug": "draftable",
    "name": "Draftable",
    "category": "other",
    "file": "draftable-5edf2ac8.webp",
    "dark": false
  },
  {
    "slug": "dripcel",
    "name": "Dripcel",
    "category": "other",
    "file": "dripcel-c3e7698e.webp",
    "dark": false
  },
  {
    "slug": "dripjobs",
    "name": "Dripjobs",
    "category": "other",
    "file": "dripjobs-fc5d6421.webp",
    "dark": false
  },
  {
    "slug": "dropbox",
    "name": "Dropbox",
    "category": "storage",
    "file": "dropbox-6f34ac61.webp",
    "dark": false
  },
  {
    "slug": "dropcontact",
    "name": "Dropcontact",
    "category": "crm",
    "file": "dropcontact-3024e18b.webp",
    "dark": false
  },
  {
    "slug": "dungeon-fighter-online",
    "name": "Dungeon Fighter Online",
    "category": "other",
    "file": "dungeon-fighter-online-da4e4827.webp",
    "dark": false
  },
  {
    "slug": "dynalist",
    "name": "Dynalist",
    "category": "other",
    "file": "dynalist-ac7f5562.webp",
    "dark": false
  },
  {
    "slug": "dynamics-365",
    "name": "Dynamics 365",
    "category": "other",
    "file": "dynamics-365-ab3c9642.webp",
    "dark": false
  },
  {
    "slug": "echtpost",
    "name": "Echtpost",
    "category": "other",
    "file": "echtpost-4c6e96dd.webp",
    "dark": false
  },
  {
    "slug": "elasticsearch",
    "name": "Elasticsearch",
    "category": "data",
    "file": "elasticsearch-d7797873.webp",
    "dark": false
  },
  {
    "slug": "elevenlabs",
    "name": "ElevenLabs",
    "category": "ai",
    "file": "elevenlabs-2ed75a09.webp",
    "dark": false
  },
  {
    "slug": "elorus",
    "name": "Elorus",
    "category": "other",
    "file": "elorus-72648574.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "emailable",
    "name": "Emailable",
    "category": "communication",
    "file": "emailable-e897795a.webp",
    "dark": false
  },
  {
    "slug": "emailoctopus",
    "name": "Emailoctopus",
    "category": "communication",
    "file": "emailoctopus-b35a8e9c.webp",
    "dark": false
  },
  {
    "slug": "emelia",
    "name": "Emelia",
    "category": "other",
    "file": "emelia-95662bb1.webp",
    "dark": false
  },
  {
    "slug": "encharge",
    "name": "Encharge",
    "category": "other",
    "file": "encharge-eaaf0466.webp",
    "dark": true
  },
  {
    "slug": "endorsal",
    "name": "Endorsal",
    "category": "other",
    "file": "endorsal-7c395394.webp",
    "dark": false
  },
  {
    "slug": "enginemailer",
    "name": "Enginemailer",
    "category": "communication",
    "file": "enginemailer-2d2a7034.webp",
    "dark": false
  },
  {
    "slug": "enigma",
    "name": "Enigma",
    "category": "other",
    "file": "enigma-77cbef27.webp",
    "dark": true
  },
  {
    "slug": "entelligence",
    "name": "Entelligence",
    "category": "other",
    "file": "entelligence-28663ea8.webp",
    "dark": false
  },
  {
    "slug": "eodhd-apis",
    "name": "Eodhd Apis",
    "category": "development",
    "file": "eodhd-apis-72648574.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "epic-games",
    "name": "Epic Games",
    "category": "other",
    "file": "epic-games-ddc7f2ea.webp",
    "dark": false
  },
  {
    "slug": "espocrm",
    "name": "Espocrm",
    "category": "crm",
    "file": "espocrm-1f625996.webp",
    "dark": false
  },
  {
    "slug": "evenium",
    "name": "Evenium",
    "category": "other",
    "file": "evenium-72648574.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "eventbrite",
    "name": "Eventbrite",
    "category": "other",
    "file": "eventbrite-0649aa00.webp",
    "dark": false
  },
  {
    "slug": "eventee",
    "name": "Eventee",
    "category": "other",
    "file": "eventee-9bdaf126.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#62c1ab"
  },
  {
    "slug": "eventzilla",
    "name": "Eventzilla",
    "category": "other",
    "file": "eventzilla-6593290a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#16c0de"
  },
  {
    "slug": "eversign",
    "name": "Eversign",
    "category": "productivity",
    "file": "eversign-72648574.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "exa",
    "name": "Exa",
    "category": "search",
    "file": "exa-9e07d21b.webp",
    "dark": false
  },
  {
    "slug": "excel",
    "name": "Excel",
    "category": "other",
    "file": "excel-5046950b.webp",
    "dark": false
  },
  {
    "slug": "exist",
    "name": "Exist",
    "category": "other",
    "file": "exist-098a7815.webp",
    "dark": true
  },
  {
    "slug": "expofp",
    "name": "Expofp",
    "category": "other",
    "file": "expofp-b7c539f4.webp",
    "dark": false
  },
  {
    "slug": "extracta-ai",
    "name": "Extracta AI",
    "category": "ai",
    "file": "extracta-ai-72648574.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "facebook",
    "name": "Facebook",
    "category": "marketing",
    "file": "facebook-b8dfc3ff.webp",
    "dark": false
  },
  {
    "slug": "factorial",
    "name": "Factorial",
    "category": "other",
    "file": "factorial-dbb4e8ed.webp",
    "dark": false
  },
  {
    "slug": "felt",
    "name": "Felt",
    "category": "other",
    "file": "felt-02e071f8.webp",
    "dark": false
  },
  {
    "slug": "fidel-api",
    "name": "Fidel Api",
    "category": "development",
    "file": "fidel-api-63e21b68.webp",
    "dark": true
  },
  {
    "slug": "figma",
    "name": "Figma",
    "category": "productivity",
    "file": "figma-84a461ff.webp",
    "dark": false
  },
  {
    "slug": "file-manager",
    "name": "File Manager",
    "category": "storage",
    "file": "file-manager-0d93e268.webp",
    "dark": false
  },
  {
    "slug": "files-com",
    "name": "Files Com",
    "category": "storage",
    "file": "files-com-4ec69aa9.webp",
    "dark": false
  },
  {
    "slug": "fillout-forms",
    "name": "Fillout Forms",
    "category": "productivity",
    "file": "fillout-forms-3e1d518c.webp",
    "dark": false
  },
  {
    "slug": "finage",
    "name": "Finage",
    "category": "other",
    "file": "finage-fbb1af15.webp",
    "dark": false
  },
  {
    "slug": "findymail",
    "name": "Findymail",
    "category": "communication",
    "file": "findymail-ae76c6ba.webp",
    "dark": true
  },
  {
    "slug": "fireberry",
    "name": "Fireberry",
    "category": "other",
    "file": "fireberry-037e73a3.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "firecrawl",
    "name": "Firecrawl",
    "category": "search",
    "file": "firecrawl-8263edf3.webp",
    "dark": false
  },
  {
    "slug": "fireflies",
    "name": "Fireflies",
    "category": "other",
    "file": "fireflies-e601ba6d.webp",
    "dark": true
  },
  {
    "slug": "fitbit",
    "name": "Fitbit",
    "category": "other",
    "file": "fitbit-ddfe447a.webp",
    "dark": false
  },
  {
    "slug": "fixer",
    "name": "Fixer",
    "category": "other",
    "file": "fixer-a50ac154.webp",
    "dark": false
  },
  {
    "slug": "fixer-io",
    "name": "Fixer IO",
    "category": "other",
    "file": "fixer-io-b9fa0320.webp",
    "dark": false
  },
  {
    "slug": "flexisign",
    "name": "Flexisign",
    "category": "productivity",
    "file": "flexisign-c01671c5.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#376be5"
  },
  {
    "slug": "flowiseai",
    "name": "Flowiseai",
    "category": "finance",
    "file": "flowiseai-553a7120.webp",
    "dark": false
  },
  {
    "slug": "flutterwave",
    "name": "Flutterwave",
    "category": "other",
    "file": "flutterwave-777faa30.webp",
    "dark": false
  },
  {
    "slug": "fluxguard",
    "name": "Fluxguard",
    "category": "other",
    "file": "fluxguard-175ed164.webp",
    "dark": false
  },
  {
    "slug": "folk",
    "name": "Folk",
    "category": "other",
    "file": "folk-71b95de9.svg",
    "dark": true
  },
  {
    "slug": "fomo",
    "name": "Fomo",
    "category": "other",
    "file": "fomo-9909d5c8.webp",
    "dark": false
  },
  {
    "slug": "formcarry",
    "name": "Formcarry",
    "category": "productivity",
    "file": "formcarry-72ed053a.webp",
    "dark": false
  },
  {
    "slug": "formdesk",
    "name": "Formdesk",
    "category": "support",
    "file": "formdesk-4132f730.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#612e7f"
  },
  {
    "slug": "formsite",
    "name": "Formsite",
    "category": "productivity",
    "file": "formsite-4946b60d.webp",
    "dark": false
  },
  {
    "slug": "foursquare",
    "name": "Foursquare",
    "category": "commerce",
    "file": "foursquare-455f7ad1.webp",
    "dark": true
  },
  {
    "slug": "fraudlabs-pro",
    "name": "Fraudlabs Pro",
    "category": "other",
    "file": "fraudlabs-pro-79105a99.webp",
    "dark": false
  },
  {
    "slug": "freshbooks",
    "name": "FreshBooks",
    "category": "finance",
    "file": "freshbooks-303a0865.webp",
    "dark": false
  },
  {
    "slug": "freshdesk",
    "name": "Freshdesk",
    "category": "support",
    "file": "freshdesk-20318d72.webp",
    "dark": false
  },
  {
    "slug": "freshservice",
    "name": "Freshservice",
    "category": "other",
    "file": "freshservice-8a309b41.webp",
    "dark": false
  },
  {
    "slug": "front",
    "name": "Front",
    "category": "support",
    "file": "front-0b439a65.webp",
    "dark": false
  },
  {
    "slug": "ftrack",
    "name": "Ftrack",
    "category": "other",
    "file": "ftrack-037e73a3.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "gagelist",
    "name": "Gagelist",
    "category": "other",
    "file": "gagelist-62f217dc.webp",
    "dark": false
  },
  {
    "slug": "gamma",
    "name": "Gamma",
    "category": "other",
    "file": "gamma-b2a22d4f.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "gan-ai",
    "name": "Gan AI",
    "category": "ai",
    "file": "gan-ai-a1f1cca9.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#623ef4"
  },
  {
    "slug": "gatherup",
    "name": "Gatherup",
    "category": "other",
    "file": "gatherup-886772b2.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0396a6"
  },
  {
    "slug": "gemini",
    "name": "Gemini",
    "category": "ai",
    "file": "gemini-9a3e1621.webp",
    "dark": false
  },
  {
    "slug": "gender-api",
    "name": "Gender Api",
    "category": "development",
    "file": "gender-api-a73d6569.webp",
    "dark": false
  },
  {
    "slug": "genderapi-io",
    "name": "Genderapi IO",
    "category": "development",
    "file": "genderapi-io-b2a22d4f.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "genderize",
    "name": "Genderize",
    "category": "other",
    "file": null,
    "dark": false
  },
  {
    "slug": "geoapify",
    "name": "Geoapify",
    "category": "development",
    "file": "geoapify-ac6dd5a4.webp",
    "dark": false
  },
  {
    "slug": "geocodio",
    "name": "Geocodio",
    "category": "other",
    "file": null,
    "dark": false
  },
  {
    "slug": "geokeo",
    "name": "Geokeo",
    "category": "other",
    "file": "geokeo-d928ba1f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#33a1df"
  },
  {
    "slug": "getdrip",
    "name": "Getdrip",
    "category": "other",
    "file": "getdrip-a5160703.webp",
    "dark": false
  },
  {
    "slug": "getform",
    "name": "Getform",
    "category": "productivity",
    "file": "getform-4f9ecac5.webp",
    "dark": false
  },
  {
    "slug": "gigasheet",
    "name": "Gigasheet",
    "category": "productivity",
    "file": "gigasheet-7683a8a8.webp",
    "dark": false
  },
  {
    "slug": "github",
    "name": "GitHub",
    "category": "development",
    "file": "github-18e8f72c.webp",
    "dark": true
  },
  {
    "slug": "gitlab",
    "name": "GitLab",
    "category": "development",
    "file": "gitlab-98265de3.webp",
    "dark": false
  },
  {
    "slug": "gleap",
    "name": "Gleap",
    "category": "other",
    "file": "gleap-7add88c6.svg",
    "dark": true
  },
  {
    "slug": "gmail",
    "name": "Gmail",
    "category": "communication",
    "file": "gmail-3727cf52.webp",
    "dark": false
  },
  {
    "slug": "gong",
    "name": "Gong",
    "category": "other",
    "file": "gong-274da292.webp",
    "dark": false
  },
  {
    "slug": "goodbits",
    "name": "Goodbits",
    "category": "other",
    "file": "goodbits-a44e3bdb.webp",
    "dark": false
  },
  {
    "slug": "googl-bigquery",
    "name": "Google BigQuery",
    "category": "data",
    "file": "googl-bigquery-1d37027d.webp",
    "dark": false
  },
  {
    "slug": "google",
    "name": "Google",
    "category": "other",
    "file": "google-31b9e699.webp",
    "dark": false
  },
  {
    "slug": "google-address-validation",
    "name": "Google Address Validation",
    "category": "other",
    "file": "google-address-validation-1041967a.webp",
    "dark": false
  },
  {
    "slug": "google-admin",
    "name": "Google Admin",
    "category": "other",
    "file": "google-admin-664c105c.webp",
    "dark": false
  },
  {
    "slug": "google-calendar",
    "name": "Google Calendar",
    "category": "productivity",
    "file": "google-calendar-6e4f5bf2.webp",
    "dark": false
  },
  {
    "slug": "google-cloud-vision",
    "name": "Google Cloud Vision",
    "category": "other",
    "file": "google-cloud-vision-1041967a.webp",
    "dark": false
  },
  {
    "slug": "google-docs",
    "name": "Google Docs",
    "category": "productivity",
    "file": "google-docs-1896f512.webp",
    "dark": false
  },
  {
    "slug": "google-drive",
    "name": "Google Drive",
    "category": "storage",
    "file": "google-drive-ed851907.webp",
    "dark": false
  },
  {
    "slug": "google-maps",
    "name": "Google Maps",
    "category": "other",
    "file": "google-maps-7abcdec8.webp",
    "dark": false
  },
  {
    "slug": "google-meet",
    "name": "Google Meet",
    "category": "communication",
    "file": "google-meet-75bc87db.webp",
    "dark": false
  },
  {
    "slug": "google-photos",
    "name": "Google Photos",
    "category": "other",
    "file": "google-photos-8b2d0560.webp",
    "dark": false
  },
  {
    "slug": "google-search-console",
    "name": "Google Search Console",
    "category": "search",
    "file": "google-search-console-6986d425.webp",
    "dark": false
  },
  {
    "slug": "google-sheets",
    "name": "Google Sheets",
    "category": "productivity",
    "file": "google-sheets-6178c074.webp",
    "dark": false
  },
  {
    "slug": "google-slides",
    "name": "Google Slides",
    "category": "productivity",
    "file": "google-slides-593b0a64.webp",
    "dark": false
  },
  {
    "slug": "google-tasks",
    "name": "Google Tasks",
    "category": "productivity",
    "file": "google-tasks-fbbbb78c.webp",
    "dark": false
  },
  {
    "slug": "googleads",
    "name": "Googleads",
    "category": "crm",
    "file": "googleads-ecda7666.webp",
    "dark": false
  },
  {
    "slug": "googleanalytics",
    "name": "Googleanalytics",
    "category": "data",
    "file": "googleanalytics-cd7bb01f.webp",
    "dark": false
  },
  {
    "slug": "gorgias",
    "name": "Gorgias",
    "category": "support",
    "file": "gorgias-942aae4c.webp",
    "dark": true
  },
  {
    "slug": "goshippo",
    "name": "Goshippo",
    "category": "other",
    "file": "goshippo-e6cb3f65.webp",
    "dark": false
  },
  {
    "slug": "gosquared",
    "name": "Gosquared",
    "category": "commerce",
    "file": "gosquared-aba9b34f.webp",
    "dark": true
  },
  {
    "slug": "gotowebinar",
    "name": "Gotowebinar",
    "category": "other",
    "file": "gotowebinar-205132e4.webp",
    "dark": false
  },
  {
    "slug": "gpt-trainer",
    "name": "Gpt Trainer",
    "category": "ai",
    "file": "gpt-trainer-faf82706.webp",
    "dark": false
  },
  {
    "slug": "graphhopper",
    "name": "Graphhopper",
    "category": "other",
    "file": "graphhopper-3c354b47.webp",
    "dark": false
  },
  {
    "slug": "groqcloud",
    "name": "Groqcloud",
    "category": "other",
    "file": "groqcloud-b2a22d4f.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "gumroad",
    "name": "Gumroad",
    "category": "commerce",
    "file": "gumroad-c19cd185.webp",
    "dark": false
  },
  {
    "slug": "guru",
    "name": "Guru",
    "category": "support",
    "file": "guru-2a0a993a.webp",
    "dark": true
  },
  {
    "slug": "gusto",
    "name": "Gusto",
    "category": "finance",
    "file": "gusto-01c163fa.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#f45d48"
  },
  {
    "slug": "habitica",
    "name": "Habitica",
    "category": "other",
    "file": "habitica-e5536d6d.webp",
    "dark": false
  },
  {
    "slug": "hackernews",
    "name": "Hackernews",
    "category": "other",
    "file": "hackernews-e5e77771.webp",
    "dark": false
  },
  {
    "slug": "hackerrank",
    "name": "Hackerrank",
    "category": "other",
    "file": "hackerrank-442ddad7.webp",
    "dark": false
  },
  {
    "slug": "harvest",
    "name": "Harvest",
    "category": "other",
    "file": "harvest-535849d5.webp",
    "dark": false
  },
  {
    "slug": "hashnode",
    "name": "Hashnode",
    "category": "other",
    "file": "hashnode-96610938.webp",
    "dark": false
  },
  {
    "slug": "helcim",
    "name": "Helcim",
    "category": "other",
    "file": "helcim-bd7596fe.webp",
    "dark": false
  },
  {
    "slug": "hellosign",
    "name": "Hellosign",
    "category": "productivity",
    "file": "hellosign-d996ee15.webp",
    "dark": false
  },
  {
    "slug": "helpdesk",
    "name": "Helpdesk",
    "category": "support",
    "file": "helpdesk-cb373e31.webp",
    "dark": false
  },
  {
    "slug": "heroku",
    "name": "Heroku",
    "category": "development",
    "file": "heroku-1717238d.webp",
    "dark": false
  },
  {
    "slug": "heygen",
    "name": "Heygen",
    "category": "other",
    "file": "heygen-1b77ba34.webp",
    "dark": false
  },
  {
    "slug": "heyreach",
    "name": "Heyreach",
    "category": "other",
    "file": "heyreach-9c45e2f6.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#91d0ff"
  },
  {
    "slug": "heyzine",
    "name": "Heyzine",
    "category": "other",
    "file": "heyzine-4a867999.webp",
    "dark": false
  },
  {
    "slug": "highlevel",
    "name": "Highlevel",
    "category": "other",
    "file": "highlevel-dc20de65.webp",
    "dark": false
  },
  {
    "slug": "honeybadger",
    "name": "Honeybadger",
    "category": "other",
    "file": "honeybadger-bbdbd5d4.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "honeyhive",
    "name": "Honeyhive",
    "category": "other",
    "file": "honeyhive-f88c4b83.webp",
    "dark": false
  },
  {
    "slug": "hookdeck",
    "name": "Hookdeck",
    "category": "other",
    "file": "hookdeck-23365f0d.webp",
    "dark": false
  },
  {
    "slug": "html-to-image",
    "name": "Html TO Image",
    "category": "other",
    "file": "html-to-image-fa625ba5.webp",
    "dark": true
  },
  {
    "slug": "hubspot",
    "name": "HubSpot",
    "category": "crm",
    "file": "hubspot-fe55efbe.webp",
    "dark": false
  },
  {
    "slug": "humanloop",
    "name": "Humanloop",
    "category": "ai",
    "file": "humanloop-0d34c7a8.webp",
    "dark": false
  },
  {
    "slug": "hyperbrowser",
    "name": "Hyperbrowser",
    "category": "search",
    "file": "hyperbrowser-aebc3903.webp",
    "dark": false
  },
  {
    "slug": "hyperise",
    "name": "Hyperise",
    "category": "other",
    "file": "hyperise-af271ca4.webp",
    "dark": false
  },
  {
    "slug": "hystruct",
    "name": "Hystruct",
    "category": "other",
    "file": "hystruct-45f13014.webp",
    "dark": true
  },
  {
    "slug": "iauditor-by-safetyculture",
    "name": "Iauditor BY Safetyculture",
    "category": "other",
    "file": "iauditor-by-safetyculture-d5865142.svg",
    "dark": true
  },
  {
    "slug": "icims",
    "name": "Icims",
    "category": "other",
    "file": "icims-2591aafc.webp",
    "dark": false
  },
  {
    "slug": "icypeas",
    "name": "Icypeas",
    "category": "other",
    "file": "icypeas-7a784aab.webp",
    "dark": false
  },
  {
    "slug": "ideascale",
    "name": "Ideascale",
    "category": "other",
    "file": "ideascale-628b885a.webp",
    "dark": false
  },
  {
    "slug": "identitycheck",
    "name": "Identitycheck",
    "category": "security",
    "file": "identitycheck-35b79f6c.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0038cf"
  },
  {
    "slug": "imagior",
    "name": "Imagior",
    "category": "other",
    "file": "imagior-38e11a6d.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#297fff"
  },
  {
    "slug": "imejis-io",
    "name": "Imejis IO",
    "category": "other",
    "file": "imejis-io-fa312e29.webp",
    "dark": true
  },
  {
    "slug": "induced-ai",
    "name": "Induced AI",
    "category": "ai",
    "file": "induced-ai-492060cc.webp",
    "dark": true
  },
  {
    "slug": "insighto-ai",
    "name": "Insighto AI",
    "category": "ai",
    "file": "insighto-ai-66f6af92.webp",
    "dark": false
  },
  {
    "slug": "instacart",
    "name": "Instacart",
    "category": "other",
    "file": "instacart-9a1f8ebf.webp",
    "dark": false
  },
  {
    "slug": "instacart-carrot",
    "name": "Instacart Carrot",
    "category": "other",
    "file": "instacart-carrot-b3083499.webp",
    "dark": false
  },
  {
    "slug": "instagram",
    "name": "Instagram",
    "category": "marketing",
    "file": "instagram-5ff904f0.webp",
    "dark": false
  },
  {
    "slug": "instantly",
    "name": "Instantly",
    "category": "other",
    "file": "instantly-3262d4da.webp",
    "dark": false
  },
  {
    "slug": "intelliprint",
    "name": "Intelliprint",
    "category": "other",
    "file": "intelliprint-a35a2a37.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ef7d00"
  },
  {
    "slug": "intercom",
    "name": "Intercom",
    "category": "support",
    "file": "intercom-0ab43d90.webp",
    "dark": false
  },
  {
    "slug": "interzoid",
    "name": "Interzoid",
    "category": "other",
    "file": "interzoid-7ef0c7d9.webp",
    "dark": false
  },
  {
    "slug": "ip2location-io",
    "name": "Ip2location IO",
    "category": "other",
    "file": "ip2location-io-035c8582.webp",
    "dark": false
  },
  {
    "slug": "ip2proxy",
    "name": "Ip2proxy",
    "category": "search",
    "file": "ip2proxy-f4ab7b68.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#084e8f"
  },
  {
    "slug": "ip2whois",
    "name": "Ip2whois",
    "category": "other",
    "file": "ip2whois-47bf5f1a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0dabc6"
  },
  {
    "slug": "ipdata-co",
    "name": "Ipdata CO",
    "category": "data",
    "file": "ipdata-co-a9084345.webp",
    "dark": true
  },
  {
    "slug": "ipinfo-io",
    "name": "Ipinfo IO",
    "category": "other",
    "file": "ipinfo-io-046ff93d.webp",
    "dark": false
  },
  {
    "slug": "iqair-airvisual",
    "name": "Iqair Airvisual",
    "category": "ai",
    "file": "iqair-airvisual-65669401.webp",
    "dark": false
  },
  {
    "slug": "jigsawstack",
    "name": "Jigsawstack",
    "category": "other",
    "file": "jigsawstack-9e3cd6c8.webp",
    "dark": false
  },
  {
    "slug": "jira",
    "name": "Jira",
    "category": "development",
    "file": "jira-1aacfcdd.webp",
    "dark": false
  },
  {
    "slug": "jobnimbus",
    "name": "Jobnimbus",
    "category": "other",
    "file": "jobnimbus-0dab7d1b.webp",
    "dark": false
  },
  {
    "slug": "jotform",
    "name": "Jotform",
    "category": "productivity",
    "file": "jotform-20177798.webp",
    "dark": false
  },
  {
    "slug": "junglescout",
    "name": "Junglescout",
    "category": "other",
    "file": "junglescout-1e6d517a.webp",
    "dark": false
  },
  {
    "slug": "kadoa",
    "name": "Kadoa",
    "category": "other",
    "file": "kadoa-4d094e07.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#fd7412"
  },
  {
    "slug": "kaleido",
    "name": "Kaleido",
    "category": "other",
    "file": "kaleido-34d5b584.webp",
    "dark": false
  },
  {
    "slug": "keap",
    "name": "Keap",
    "category": "other",
    "file": "keap-f180239f.webp",
    "dark": false
  },
  {
    "slug": "kibana",
    "name": "Kibana",
    "category": "other",
    "file": "kibana-6472b082.webp",
    "dark": false
  },
  {
    "slug": "kickbox",
    "name": "Kickbox",
    "category": "storage",
    "file": "kickbox-072fa233.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "kit",
    "name": "Kit",
    "category": "other",
    "file": "kit-f181f8af.webp",
    "dark": false
  },
  {
    "slug": "klaviyo",
    "name": "Klaviyo",
    "category": "marketing",
    "file": "klaviyo-1c229df4.webp",
    "dark": false
  },
  {
    "slug": "klipfolio",
    "name": "Klipfolio",
    "category": "other",
    "file": "klipfolio-0c06b9f3.webp",
    "dark": false
  },
  {
    "slug": "kommo",
    "name": "Kommo",
    "category": "other",
    "file": "kommo-560882e8.webp",
    "dark": false
  },
  {
    "slug": "kontent-ai",
    "name": "Kontent AI",
    "category": "ai",
    "file": "kontent-ai-386e521e.svg",
    "dark": true
  },
  {
    "slug": "kraken-io",
    "name": "Kraken IO",
    "category": "other",
    "file": "kraken-io-46ee7bbd.webp",
    "dark": false
  },
  {
    "slug": "labs64-netlicensing",
    "name": "Labs64 Netlicensing",
    "category": "other",
    "file": "labs64-netlicensing-e714aeb8.webp",
    "dark": false
  },
  {
    "slug": "landbot",
    "name": "Landbot",
    "category": "other",
    "file": "landbot-efdc9fa3.webp",
    "dark": false
  },
  {
    "slug": "lastpass",
    "name": "Lastpass",
    "category": "other",
    "file": "lastpass-86f925a2.webp",
    "dark": false
  },
  {
    "slug": "launch-darkly",
    "name": "Launch Darkly",
    "category": "other",
    "file": "launch-darkly-4aa0db9e.webp",
    "dark": true
  },
  {
    "slug": "leadfeeder",
    "name": "Leadfeeder",
    "category": "crm",
    "file": "leadfeeder-f5216dc9.webp",
    "dark": false
  },
  {
    "slug": "leiga",
    "name": "Leiga",
    "category": "other",
    "file": "leiga-f5d4ade2.webp",
    "dark": false
  },
  {
    "slug": "lemlist",
    "name": "Lemlist",
    "category": "other",
    "file": "lemlist-fb4236c7.webp",
    "dark": false
  },
  {
    "slug": "lemonsqueezy",
    "name": "Lemonsqueezy",
    "category": "commerce",
    "file": "lemonsqueezy-78df2688.webp",
    "dark": false
  },
  {
    "slug": "lessonspace",
    "name": "Lessonspace",
    "category": "security",
    "file": "lessonspace-8e13c30a.webp",
    "dark": false
  },
  {
    "slug": "lever",
    "name": "Lever",
    "category": "hr",
    "file": "lever-e1b2d542.webp",
    "dark": false
  },
  {
    "slug": "lexoffice",
    "name": "Lexoffice",
    "category": "other",
    "file": "lexoffice-b6f9c1d4.webp",
    "dark": false
  },
  {
    "slug": "linear",
    "name": "Linear",
    "category": "development",
    "file": "linear-934f0351.webp",
    "dark": true
  },
  {
    "slug": "linkedin",
    "name": "LinkedIn",
    "category": "marketing",
    "file": "linkedin-53398fb9.webp",
    "dark": false
  },
  {
    "slug": "linkhut",
    "name": "Linkhut",
    "category": "other",
    "file": "linkhut-12096901.webp",
    "dark": false
  },
  {
    "slug": "linkup",
    "name": "Linkup",
    "category": "other",
    "file": "linkup-e0c39cdd.webp",
    "dark": true
  },
  {
    "slug": "listennotes",
    "name": "Listennotes",
    "category": "productivity",
    "file": "listennotes-9d31ab9f.webp",
    "dark": false
  },
  {
    "slug": "livesession",
    "name": "Livesession",
    "category": "other",
    "file": "livesession-b56e157a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#196cff"
  },
  {
    "slug": "lmnt",
    "name": "Lmnt",
    "category": "other",
    "file": "lmnt-2faca780.webp",
    "dark": false
  },
  {
    "slug": "lodgify",
    "name": "Lodgify",
    "category": "other",
    "file": "lodgify-3cbdcd77.webp",
    "dark": false
  },
  {
    "slug": "logo-dev",
    "name": "Logo Dev",
    "category": "other",
    "file": "logo-dev-9aa7c645.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "loomio",
    "name": "Loomio",
    "category": "other",
    "file": "loomio-61a2135f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#dca034"
  },
  {
    "slug": "loyverse",
    "name": "Loyverse",
    "category": "other",
    "file": "loyverse-d4f24fc3.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#f6833c"
  },
  {
    "slug": "magnetic",
    "name": "Magnetic",
    "category": "other",
    "file": "magnetic-0768991c.webp",
    "dark": false
  },
  {
    "slug": "mailboxlayer",
    "name": "Mailboxlayer",
    "category": "communication",
    "file": "mailboxlayer-b9fa0320.webp",
    "dark": false
  },
  {
    "slug": "mailcheck",
    "name": "Mailcheck",
    "category": "communication",
    "file": "mailcheck-99fb5aea.webp",
    "dark": true
  },
  {
    "slug": "mailchimp",
    "name": "Mailchimp",
    "category": "communication",
    "file": "mailchimp-20ec76fa.webp",
    "dark": true
  },
  {
    "slug": "mailcoach",
    "name": "Mailcoach",
    "category": "communication",
    "file": "mailcoach-ecb7cac4.webp",
    "dark": false
  },
  {
    "slug": "mailerlite",
    "name": "Mailerlite",
    "category": "communication",
    "file": "mailerlite-a3856e5c.webp",
    "dark": false
  },
  {
    "slug": "mails-so",
    "name": "Mails SO",
    "category": "communication",
    "file": "mails-so-2eaf4182.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "maintainx",
    "name": "Maintainx",
    "category": "ai",
    "file": "maintainx-16c14a46.webp",
    "dark": false
  },
  {
    "slug": "manychat",
    "name": "Manychat",
    "category": "communication",
    "file": "manychat-373477ed.svg",
    "dark": true
  },
  {
    "slug": "mapbox",
    "name": "Mapbox",
    "category": "storage",
    "file": "mapbox-164b9520.webp",
    "dark": false
  },
  {
    "slug": "mapulus",
    "name": "Mapulus",
    "category": "other",
    "file": "mapulus-8a0cf536.webp",
    "dark": false
  },
  {
    "slug": "mboum",
    "name": "Mboum",
    "category": "other",
    "file": "mboum-1fccaf1c.webp",
    "dark": true
  },
  {
    "slug": "mem0",
    "name": "Mem0",
    "category": "other",
    "file": "mem0-b811c05e.webp",
    "dark": false
  },
  {
    "slug": "memberspot",
    "name": "Memberspot",
    "category": "other",
    "file": "memberspot-2eaf4182.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "memberstack",
    "name": "Memberstack",
    "category": "other",
    "file": "memberstack-5e6e8962.webp",
    "dark": false
  },
  {
    "slug": "membervault",
    "name": "Membervault",
    "category": "security",
    "file": "membervault-9cb69f5f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#3cba6c"
  },
  {
    "slug": "meta",
    "name": "Meta",
    "category": "other",
    "file": "meta-dd7b672b.webp",
    "dark": false
  },
  {
    "slug": "metaphor",
    "name": "Metaphor",
    "category": "other",
    "file": "metaphor-55cef454.webp",
    "dark": false
  },
  {
    "slug": "metatextai",
    "name": "Metatextai",
    "category": "ai",
    "file": "metatextai-83fa316e.webp",
    "dark": false
  },
  {
    "slug": "mezmo",
    "name": "Mezmo",
    "category": "other",
    "file": "mezmo-604b77c7.webp",
    "dark": true
  },
  {
    "slug": "microsoft-clarity",
    "name": "Microsoft Clarity",
    "category": "other",
    "file": "microsoft-clarity-48122468.webp",
    "dark": false
  },
  {
    "slug": "microsoft-teams",
    "name": "Microsoft Teams",
    "category": "communication",
    "file": "microsoft-teams-99b904d7.webp",
    "dark": false
  },
  {
    "slug": "microsoft-tenant",
    "name": "Microsoft Tenant",
    "category": "other",
    "file": "microsoft-tenant-eccfd074.webp",
    "dark": false
  },
  {
    "slug": "microsoft-tenant-specific",
    "name": "Microsoft Tenant Specific",
    "category": "other",
    "file": "microsoft-tenant-specific-973358ea.webp",
    "dark": false
  },
  {
    "slug": "miro",
    "name": "Miro",
    "category": "productivity",
    "file": "miro-e6ed8bca.webp",
    "dark": false
  },
  {
    "slug": "missive",
    "name": "Missive",
    "category": "other",
    "file": "missive-2eaf4182.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "mistral-ai",
    "name": "Mistral AI",
    "category": "ai",
    "file": "mistral-ai-3d35584b.webp",
    "dark": false
  },
  {
    "slug": "mixpanel",
    "name": "Mixpanel",
    "category": "data",
    "file": "mixpanel-b81c0bed.svg",
    "dark": true
  },
  {
    "slug": "mocean-api",
    "name": "Mocean Api",
    "category": "development",
    "file": "mocean-api-6a2e661e.webp",
    "dark": false
  },
  {
    "slug": "moco",
    "name": "Moco",
    "category": "other",
    "file": "moco-0de32e0f.webp",
    "dark": false
  },
  {
    "slug": "modelry",
    "name": "Modelry",
    "category": "other",
    "file": "modelry-6da9474f.webp",
    "dark": false
  },
  {
    "slug": "monday",
    "name": "Monday",
    "category": "productivity",
    "file": "monday-9e1aba47.webp",
    "dark": false
  },
  {
    "slug": "moneybird",
    "name": "Moneybird",
    "category": "other",
    "file": "moneybird-7d3401ca.webp",
    "dark": false
  },
  {
    "slug": "moonclerk",
    "name": "Moonclerk",
    "category": "other",
    "file": "moonclerk-8e01ebd6.webp",
    "dark": false
  },
  {
    "slug": "moosend",
    "name": "Moosend",
    "category": "other",
    "file": "moosend-0f0e2d11.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#e2011a"
  },
  {
    "slug": "mopinion",
    "name": "Mopinion",
    "category": "other",
    "file": "mopinion-8996539c.webp",
    "dark": false
  },
  {
    "slug": "more-trees",
    "name": "More Trees",
    "category": "other",
    "file": "more-trees-97160c03.webp",
    "dark": false
  },
  {
    "slug": "moxie",
    "name": "Moxie",
    "category": "other",
    "file": "moxie-f8059078.webp",
    "dark": false
  },
  {
    "slug": "moz",
    "name": "Moz",
    "category": "other",
    "file": "moz-8116be0f.webp",
    "dark": false
  },
  {
    "slug": "msg91",
    "name": "Msg91",
    "category": "other",
    "file": "msg91-11158ede.webp",
    "dark": false
  },
  {
    "slug": "multionai",
    "name": "Multionai",
    "category": "ai",
    "file": "multionai-9007374d.webp",
    "dark": false
  },
  {
    "slug": "mural",
    "name": "Mural",
    "category": "other",
    "file": "mural-f86fb81f.webp",
    "dark": false
  },
  {
    "slug": "mx-technologies",
    "name": "MX Technologies",
    "category": "other",
    "file": "mx-technologies-c9ae681e.svg",
    "dark": true
  },
  {
    "slug": "nango",
    "name": "Nango",
    "category": "other",
    "file": "nango-b122204b.webp",
    "dark": false
  },
  {
    "slug": "nano-nets",
    "name": "Nano Nets",
    "category": "other",
    "file": "nano-nets-229ab3b5.webp",
    "dark": false
  },
  {
    "slug": "nasa",
    "name": "Nasa",
    "category": "other",
    "file": "nasa-2e62d756.webp",
    "dark": false
  },
  {
    "slug": "nasdaq",
    "name": "Nasdaq",
    "category": "other",
    "file": "nasdaq-32b13a37.webp",
    "dark": false
  },
  {
    "slug": "ncscale",
    "name": "Ncscale",
    "category": "other",
    "file": "ncscale-6d445745.webp",
    "dark": false
  },
  {
    "slug": "needle",
    "name": "Needle",
    "category": "other",
    "file": "needle-90f26b33.webp",
    "dark": false
  },
  {
    "slug": "neon",
    "name": "Neon",
    "category": "other",
    "file": "neon-c3973f14.webp",
    "dark": true
  },
  {
    "slug": "netsuite",
    "name": "NetSuite",
    "category": "other",
    "file": "netsuite-198fca25.webp",
    "dark": false
  },
  {
    "slug": "neuronwriter",
    "name": "Neuronwriter",
    "category": "other",
    "file": "neuronwriter-4bfcae12.webp",
    "dark": false
  },
  {
    "slug": "neverbounce",
    "name": "Neverbounce",
    "category": "other",
    "file": "neverbounce-1c8e94fc.webp",
    "dark": false
  },
  {
    "slug": "nextdns",
    "name": "Nextdns",
    "category": "other",
    "file": "nextdns-329c8e2f.webp",
    "dark": false
  },
  {
    "slug": "ngrok",
    "name": "Ngrok",
    "category": "other",
    "file": "ngrok-9fde4823.webp",
    "dark": false
  },
  {
    "slug": "ninox",
    "name": "Ninox",
    "category": "other",
    "file": "ninox-79f89a30.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#262f4d"
  },
  {
    "slug": "nioleads",
    "name": "Nioleads",
    "category": "crm",
    "file": null,
    "dark": false
  },
  {
    "slug": "notion",
    "name": "Notion",
    "category": "productivity",
    "file": "notion-36349501.webp",
    "dark": false
  },
  {
    "slug": "npm",
    "name": "Npm",
    "category": "development",
    "file": "npm-6120ecc5.webp",
    "dark": false
  },
  {
    "slug": "ocrspace",
    "name": "Ocrspace",
    "category": "other",
    "file": "ocrspace-66270732.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#053664"
  },
  {
    "slug": "oksign",
    "name": "Oksign",
    "category": "productivity",
    "file": "oksign-f8bb7fe0.webp",
    "dark": false
  },
  {
    "slug": "okta",
    "name": "Okta",
    "category": "security",
    "file": "okta-e708ec90.webp",
    "dark": true
  },
  {
    "slug": "omnisend",
    "name": "Omnisend",
    "category": "other",
    "file": "omnisend-0875eb93.webp",
    "dark": false
  },
  {
    "slug": "oncehub",
    "name": "Oncehub",
    "category": "other",
    "file": "oncehub-ed26937b.webp",
    "dark": false
  },
  {
    "slug": "one-drive",
    "name": "OneDrive",
    "category": "storage",
    "file": "one-drive-ba97fa26.webp",
    "dark": false
  },
  {
    "slug": "onedesk",
    "name": "Onedesk",
    "category": "support",
    "file": "onedesk-45bf9db7.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#3486aa"
  },
  {
    "slug": "onedrive",
    "name": "OneDrive",
    "category": "storage",
    "file": "onedrive-36c4de49.webp",
    "dark": false
  },
  {
    "slug": "onepage",
    "name": "Onepage",
    "category": "other",
    "file": "onepage-1890bf99.webp",
    "dark": true
  },
  {
    "slug": "onesignal-rest-api",
    "name": "Onesignal Rest Api",
    "category": "development",
    "file": "onesignal-rest-api-de378704.svg",
    "dark": true
  },
  {
    "slug": "onesignal-user-auth",
    "name": "Onesignal User Auth",
    "category": "security",
    "file": "onesignal-user-auth-de378704.svg",
    "dark": true
  },
  {
    "slug": "openai",
    "name": "OpenAI",
    "category": "ai",
    "file": "openai-069c2e1e.webp",
    "dark": true
  },
  {
    "slug": "opencage",
    "name": "Opencage",
    "category": "other",
    "file": "opencage-141bbc84.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#029d47"
  },
  {
    "slug": "opensea",
    "name": "Opensea",
    "category": "other",
    "file": "opensea-1c7662d0.webp",
    "dark": false
  },
  {
    "slug": "optimoroute",
    "name": "Optimoroute",
    "category": "other",
    "file": "optimoroute-71469a05.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "osu",
    "name": "Osu",
    "category": "other",
    "file": "osu-919bba1b.webp",
    "dark": false
  },
  {
    "slug": "outlook",
    "name": "Outlook",
    "category": "communication",
    "file": "outlook-a8b21d9e.webp",
    "dark": false
  },
  {
    "slug": "outreach",
    "name": "Outreach",
    "category": "crm",
    "file": "outreach-a5550146.webp",
    "dark": false
  },
  {
    "slug": "owl-protocol",
    "name": "Owl Protocol",
    "category": "other",
    "file": "owl-protocol-e083e584.webp",
    "dark": false
  },
  {
    "slug": "pagerduty",
    "name": "PagerDuty",
    "category": "other",
    "file": "pagerduty-23618740.webp",
    "dark": false
  },
  {
    "slug": "pandadoc",
    "name": "Pandadoc",
    "category": "productivity",
    "file": "pandadoc-e7d2bae1.webp",
    "dark": false
  },
  {
    "slug": "parallel",
    "name": "Parallel",
    "category": "other",
    "file": "parallel-ee6beed9.webp",
    "dark": true
  },
  {
    "slug": "parma",
    "name": "Parma",
    "category": "other",
    "file": null,
    "dark": false
  },
  {
    "slug": "parsehub",
    "name": "Parsehub",
    "category": "other",
    "file": "parsehub-6bf1f14e.webp",
    "dark": false
  },
  {
    "slug": "parseur",
    "name": "Parseur",
    "category": "other",
    "file": "parseur-1fa2a2ac.webp",
    "dark": false
  },
  {
    "slug": "passcreator",
    "name": "Passcreator",
    "category": "other",
    "file": "passcreator-4a517e6c.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#cf4500"
  },
  {
    "slug": "passslot",
    "name": "Passslot",
    "category": "other",
    "file": "passslot-e7d8a2b0.webp",
    "dark": false
  },
  {
    "slug": "payhip",
    "name": "Payhip",
    "category": "finance",
    "file": "payhip-439a8a95.webp",
    "dark": false
  },
  {
    "slug": "pdf-api-io",
    "name": "Pdf Api IO",
    "category": "development",
    "file": "pdf-api-io-ad2e2e75.webp",
    "dark": false
  },
  {
    "slug": "pdf-co",
    "name": "Pdf CO",
    "category": "productivity",
    "file": "pdf-co-c0a22b54.webp",
    "dark": false
  },
  {
    "slug": "pdf4me",
    "name": "Pdf4me",
    "category": "productivity",
    "file": "pdf4me-62e77d69.webp",
    "dark": false
  },
  {
    "slug": "pdfless",
    "name": "Pdfless",
    "category": "productivity",
    "file": "pdfless-222bfd42.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#1d6864"
  },
  {
    "slug": "pdl",
    "name": "Pdl",
    "category": "other",
    "file": "pdl-16c52321.webp",
    "dark": false
  },
  {
    "slug": "perplexity",
    "name": "Perplexity",
    "category": "ai",
    "file": "perplexity-fbeac747.webp",
    "dark": true
  },
  {
    "slug": "persistiq",
    "name": "Persistiq",
    "category": "other",
    "file": "persistiq-7d672d55.webp",
    "dark": false
  },
  {
    "slug": "pexels",
    "name": "Pexels",
    "category": "other",
    "file": "pexels-d4c08ba3.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "phantombuster",
    "name": "Phantombuster",
    "category": "other",
    "file": "phantombuster-af0279b8.webp",
    "dark": false
  },
  {
    "slug": "piggy",
    "name": "Piggy",
    "category": "other",
    "file": "piggy-d20a9dcb.webp",
    "dark": false
  },
  {
    "slug": "piloterr",
    "name": "Piloterr",
    "category": "other",
    "file": "piloterr-d4c08ba3.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "pilvio",
    "name": "Pilvio",
    "category": "other",
    "file": "pilvio-b79ff181.webp",
    "dark": false
  },
  {
    "slug": "pinecone",
    "name": "Pinecone",
    "category": "ai",
    "file": "pinecone-8cb17987.webp",
    "dark": false
  },
  {
    "slug": "pingbell",
    "name": "Pingbell",
    "category": "other",
    "file": "pingbell-288767d2.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#201e52"
  },
  {
    "slug": "pingdom",
    "name": "Pingdom",
    "category": "other",
    "file": "pingdom-f5e7754d.webp",
    "dark": false
  },
  {
    "slug": "pipedrive",
    "name": "Pipedrive",
    "category": "crm",
    "file": "pipedrive-f04fa9ab.webp",
    "dark": false
  },
  {
    "slug": "pipeline-crm",
    "name": "Pipeline Crm",
    "category": "crm",
    "file": "pipeline-crm-5c3ad4e8.webp",
    "dark": false
  },
  {
    "slug": "placekey",
    "name": "Placekey",
    "category": "other",
    "file": "placekey-ce6cf341.webp",
    "dark": false
  },
  {
    "slug": "placid",
    "name": "Placid",
    "category": "other",
    "file": "placid-09c21a29.webp",
    "dark": false
  },
  {
    "slug": "plain",
    "name": "Plain",
    "category": "ai",
    "file": "plain-5e4eb6a5.webp",
    "dark": true
  },
  {
    "slug": "planyo-online-booking",
    "name": "Planyo Online Booking",
    "category": "other",
    "file": "planyo-online-booking-7ed8de97.webp",
    "dark": false
  },
  {
    "slug": "plasmic",
    "name": "Plasmic",
    "category": "other",
    "file": "plasmic-d2ca2107.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ad4ff9"
  },
  {
    "slug": "platerecognizer",
    "name": "Platerecognizer",
    "category": "other",
    "file": "platerecognizer-db78c70a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#1677f0"
  },
  {
    "slug": "plisio",
    "name": "Plisio",
    "category": "other",
    "file": "plisio-967b8ab5.webp",
    "dark": false
  },
  {
    "slug": "polygon",
    "name": "Polygon",
    "category": "finance",
    "file": "polygon-2a4450fb.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#5f5cff"
  },
  {
    "slug": "polygon-io",
    "name": "Polygon IO",
    "category": "other",
    "file": "polygon-io-2a4450fb.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#5f5cff"
  },
  {
    "slug": "poptin",
    "name": "Poptin",
    "category": "other",
    "file": "poptin-0b6d6786.webp",
    "dark": false
  },
  {
    "slug": "postgrid",
    "name": "Postgrid",
    "category": "other",
    "file": "postgrid-1695e737.webp",
    "dark": false
  },
  {
    "slug": "postgrid-verify",
    "name": "Postgrid Verify",
    "category": "other",
    "file": "postgrid-verify-1695e737.webp",
    "dark": false
  },
  {
    "slug": "posthog",
    "name": "Posthog",
    "category": "data",
    "file": "posthog-46cab7c8.webp",
    "dark": false
  },
  {
    "slug": "postmark",
    "name": "Postmark",
    "category": "other",
    "file": "postmark-26997658.webp",
    "dark": false
  },
  {
    "slug": "precoro",
    "name": "Precoro",
    "category": "other",
    "file": "precoro-ceb48bb6.webp",
    "dark": false
  },
  {
    "slug": "prerender",
    "name": "Prerender",
    "category": "other",
    "file": "prerender-623d809a.webp",
    "dark": false
  },
  {
    "slug": "printnode",
    "name": "Printnode",
    "category": "other",
    "file": "printnode-d246f4d0.webp",
    "dark": false
  },
  {
    "slug": "prisma",
    "name": "Prisma",
    "category": "other",
    "file": "prisma-daee69d9.webp",
    "dark": false
  },
  {
    "slug": "prismic",
    "name": "Prismic",
    "category": "other",
    "file": "prismic-54296f47.webp",
    "dark": false
  },
  {
    "slug": "process-street",
    "name": "Process Street",
    "category": "other",
    "file": "process-street-c7eec307.webp",
    "dark": false
  },
  {
    "slug": "productboard",
    "name": "Productboard",
    "category": "commerce",
    "file": "productboard-cb412bfc.webp",
    "dark": false
  },
  {
    "slug": "productlane",
    "name": "Productlane",
    "category": "commerce",
    "file": "productlane-f5430fec.webp",
    "dark": false
  },
  {
    "slug": "project-bubble",
    "name": "Project Bubble",
    "category": "productivity",
    "file": null,
    "dark": false
  },
  {
    "slug": "promptmate-io",
    "name": "Promptmate IO",
    "category": "other",
    "file": "promptmate-io-f3193076.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#3f9380"
  },
  {
    "slug": "proofly",
    "name": "Proofly",
    "category": "other",
    "file": "proofly-949cee8a.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0f71ff"
  },
  {
    "slug": "propelauth",
    "name": "Propelauth",
    "category": "security",
    "file": null,
    "dark": false
  },
  {
    "slug": "proxiedmail",
    "name": "Proxiedmail",
    "category": "communication",
    "file": "proxiedmail-99f01334.webp",
    "dark": false
  },
  {
    "slug": "push-by-techulus",
    "name": "Push BY Techulus",
    "category": "other",
    "file": "push-by-techulus-8a53e8e2.webp",
    "dark": false
  },
  {
    "slug": "pushbullet",
    "name": "Pushbullet",
    "category": "other",
    "file": "pushbullet-fb5be748.webp",
    "dark": false
  },
  {
    "slug": "pushover",
    "name": "Pushover",
    "category": "other",
    "file": "pushover-87ea0874.webp",
    "dark": false
  },
  {
    "slug": "qdrant",
    "name": "Qdrant",
    "category": "ai",
    "file": "qdrant-1c6ff5a2.webp",
    "dark": false
  },
  {
    "slug": "quaderno",
    "name": "Quaderno",
    "category": "other",
    "file": "quaderno-40a04c4d.webp",
    "dark": false
  },
  {
    "slug": "qualaroo",
    "name": "Qualaroo",
    "category": "other",
    "file": "qualaroo-fad24769.webp",
    "dark": false
  },
  {
    "slug": "quickbooks",
    "name": "QuickBooks",
    "category": "finance",
    "file": "quickbooks-1f60a5a5.webp",
    "dark": false
  },
  {
    "slug": "radar",
    "name": "Radar",
    "category": "other",
    "file": "radar-68691c79.webp",
    "dark": false
  },
  {
    "slug": "rafflys",
    "name": "Rafflys",
    "category": "other",
    "file": "rafflys-47780ff9.webp",
    "dark": false
  },
  {
    "slug": "ragic",
    "name": "Ragic",
    "category": "other",
    "file": "ragic-6542404d.webp",
    "dark": false
  },
  {
    "slug": "raisely",
    "name": "Raisely",
    "category": "ai",
    "file": "raisely-1bbc59df.webp",
    "dark": false
  },
  {
    "slug": "ramp",
    "name": "Ramp",
    "category": "finance",
    "file": "ramp-d332e460.svg",
    "dark": true
  },
  {
    "slug": "ravenseotools",
    "name": "Ravenseotools",
    "category": "marketing",
    "file": "ravenseotools-fb2f850c.webp",
    "dark": false
  },
  {
    "slug": "re-amaze",
    "name": "RE Amaze",
    "category": "other",
    "file": "re-amaze-1ca42375.webp",
    "dark": false
  },
  {
    "slug": "realphonevalidation",
    "name": "Realphonevalidation",
    "category": "other",
    "file": "realphonevalidation-b42b4bd3.webp",
    "dark": false
  },
  {
    "slug": "recall",
    "name": "Recall",
    "category": "communication",
    "file": "recall-23a79174.webp",
    "dark": false
  },
  {
    "slug": "recruitee",
    "name": "Recruitee",
    "category": "hr",
    "file": "recruitee-3a08ca85.webp",
    "dark": false
  },
  {
    "slug": "reddit",
    "name": "Reddit",
    "category": "marketing",
    "file": "reddit-b5350c51.webp",
    "dark": false
  },
  {
    "slug": "refiner",
    "name": "Refiner",
    "category": "other",
    "file": "refiner-dd3b07b2.webp",
    "dark": false
  },
  {
    "slug": "remote-retrieval",
    "name": "Remote Retrieval",
    "category": "other",
    "file": "remote-retrieval-f16f32c9.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#00b7f0"
  },
  {
    "slug": "render",
    "name": "Render",
    "category": "development",
    "file": "render-37ecdbd6.svg",
    "dark": true
  },
  {
    "slug": "renderform",
    "name": "Renderform",
    "category": "productivity",
    "file": "renderform-63a03e37.webp",
    "dark": false
  },
  {
    "slug": "repairshopr",
    "name": "Repairshopr",
    "category": "commerce",
    "file": "repairshopr-f7242651.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#427db7"
  },
  {
    "slug": "replicate",
    "name": "Replicate",
    "category": "ai",
    "file": "replicate-c4150b64.webp",
    "dark": true
  },
  {
    "slug": "reply",
    "name": "Reply",
    "category": "other",
    "file": "reply-adb7cd05.webp",
    "dark": false
  },
  {
    "slug": "reply-io",
    "name": "Reply IO",
    "category": "other",
    "file": "reply-io-76de4087.svg",
    "dark": true
  },
  {
    "slug": "resend",
    "name": "Resend",
    "category": "other",
    "file": "resend-9e7c3172.webp",
    "dark": true
  },
  {
    "slug": "respond-io",
    "name": "Respond IO",
    "category": "other",
    "file": "respond-io-057119c8.webp",
    "dark": true
  },
  {
    "slug": "retellai",
    "name": "Retellai",
    "category": "ai",
    "file": "retellai-5810598b.webp",
    "dark": false
  },
  {
    "slug": "retently",
    "name": "Retently",
    "category": "other",
    "file": "retently-a033e2e2.webp",
    "dark": false
  },
  {
    "slug": "rev-ai",
    "name": "Rev AI",
    "category": "ai",
    "file": "rev-ai-aa702eda.webp",
    "dark": false
  },
  {
    "slug": "revolt",
    "name": "Revolt",
    "category": "other",
    "file": "revolt-1ebc1b7e.webp",
    "dark": true
  },
  {
    "slug": "reward-sciences",
    "name": "Reward Sciences",
    "category": "other",
    "file": "reward-sciences-3085d1a5.webp",
    "dark": false
  },
  {
    "slug": "riddle-quiz-maker",
    "name": "Riddle Quiz Maker",
    "category": "other",
    "file": "riddle-quiz-maker-77a00dce.webp",
    "dark": false
  },
  {
    "slug": "ring-central",
    "name": "Ring Central",
    "category": "other",
    "file": "ring-central-46d759f2.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ff7a00"
  },
  {
    "slug": "rippiling",
    "name": "Rippiling",
    "category": "other",
    "file": "rippiling-15e27692.webp",
    "dark": false
  },
  {
    "slug": "ritekit",
    "name": "Ritekit",
    "category": "other",
    "file": "ritekit-0180f1b8.svg",
    "dark": true
  },
  {
    "slug": "rkvst",
    "name": "Rkvst",
    "category": "other",
    "file": "rkvst-26e1d926.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#00458d"
  },
  {
    "slug": "rocketlane",
    "name": "Rocketlane",
    "category": "other",
    "file": "rocketlane-96a1eab0.webp",
    "dark": true
  },
  {
    "slug": "rocketreach",
    "name": "Rocketreach",
    "category": "other",
    "file": "rocketreach-df6b15c8.webp",
    "dark": false
  },
  {
    "slug": "rootly",
    "name": "Rootly",
    "category": "other",
    "file": "rootly-5de27f6e.webp",
    "dark": false
  },
  {
    "slug": "rosette-text-analytics",
    "name": "Rosette Text Analytics",
    "category": "data",
    "file": "rosette-text-analytics-82f28e71.webp",
    "dark": true
  },
  {
    "slug": "route4me",
    "name": "Route4me",
    "category": "other",
    "file": "route4me-23e7c1d0.webp",
    "dark": false
  },
  {
    "slug": "safetyculture",
    "name": "Safetyculture",
    "category": "other",
    "file": "safetyculture-d5865142.svg",
    "dark": true
  },
  {
    "slug": "sage",
    "name": "Sage",
    "category": "other",
    "file": "sage-bd0d40ce.webp",
    "dark": false
  },
  {
    "slug": "salesforce",
    "name": "Salesforce",
    "category": "crm",
    "file": "salesforce-f4b64787.webp",
    "dark": false
  },
  {
    "slug": "salesmate",
    "name": "Salesmate",
    "category": "crm",
    "file": "salesmate-64fc619a.webp",
    "dark": false
  },
  {
    "slug": "satismeter",
    "name": "Satismeter",
    "category": "other",
    "file": "satismeter-2e62a04f.webp",
    "dark": false
  },
  {
    "slug": "scrape-do",
    "name": "Scrape DO",
    "category": "search",
    "file": "scrape-do-9eb0015a.webp",
    "dark": true
  },
  {
    "slug": "scrapedo",
    "name": "Scrapedo",
    "category": "search",
    "file": "scrapedo-9eb0015a.webp",
    "dark": true
  },
  {
    "slug": "scrapegraph-ai",
    "name": "Scrapegraph AI",
    "category": "ai",
    "file": "scrapegraph-ai-e7a1d8a2.webp",
    "dark": false
  },
  {
    "slug": "scrapingant",
    "name": "Scrapingant",
    "category": "development",
    "file": "scrapingant-292d741c.webp",
    "dark": false
  },
  {
    "slug": "scrapingbee",
    "name": "Scrapingbee",
    "category": "development",
    "file": "scrapingbee-e2295e2a.webp",
    "dark": false
  },
  {
    "slug": "screendesk",
    "name": "Screendesk",
    "category": "support",
    "file": "screendesk-d997f6a7.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#fa9393"
  },
  {
    "slug": "screenshot-fyi",
    "name": "Screenshot Fyi",
    "category": "other",
    "file": "screenshot-fyi-b09e1f9c.webp",
    "dark": true
  },
  {
    "slug": "screenshotone",
    "name": "Screenshotone",
    "category": "other",
    "file": "screenshotone-b1df1230.webp",
    "dark": false
  },
  {
    "slug": "segmetrics",
    "name": "Segmetrics",
    "category": "other",
    "file": "segmetrics-5de39276.webp",
    "dark": false
  },
  {
    "slug": "semanticscholar",
    "name": "Semanticscholar",
    "category": "other",
    "file": "semanticscholar-83db4bba.webp",
    "dark": false
  },
  {
    "slug": "semrush",
    "name": "Semrush",
    "category": "marketing",
    "file": "semrush-463c0d1d.webp",
    "dark": false
  },
  {
    "slug": "sendbird",
    "name": "Sendbird",
    "category": "other",
    "file": "sendbird-bfd5d648.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "sendbird-ai-chabot",
    "name": "Sendbird AI Chabot",
    "category": "ai",
    "file": "sendbird-ai-chabot-bfd5d648.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "sendfox",
    "name": "Sendfox",
    "category": "other",
    "file": null,
    "dark": false
  },
  {
    "slug": "sendgrid",
    "name": "SendGrid",
    "category": "other",
    "file": "sendgrid-a1eb1424.webp",
    "dark": false
  },
  {
    "slug": "sendlane",
    "name": "Sendlane",
    "category": "other",
    "file": "sendlane-ee56094c.svg",
    "dark": true
  },
  {
    "slug": "sendloop",
    "name": "Sendloop",
    "category": "other",
    "file": "sendloop-ce0c805b.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#c93327"
  },
  {
    "slug": "sendspark",
    "name": "Sendspark",
    "category": "other",
    "file": "sendspark-4eab4ca2.webp",
    "dark": false
  },
  {
    "slug": "sensibo",
    "name": "Sensibo",
    "category": "other",
    "file": "sensibo-6f6e09d8.webp",
    "dark": false
  },
  {
    "slug": "sentry",
    "name": "Sentry",
    "category": "development",
    "file": "sentry-1dcf7fb7.webp",
    "dark": true
  },
  {
    "slug": "seqera",
    "name": "Seqera",
    "category": "other",
    "file": "seqera-6119d217.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#3d95fd"
  },
  {
    "slug": "serpapi",
    "name": "Serpapi",
    "category": "development",
    "file": "serpapi-c632215b.webp",
    "dark": false
  },
  {
    "slug": "serpdog",
    "name": "Serpdog",
    "category": "search",
    "file": "serpdog-d5bd6c9e.webp",
    "dark": true
  },
  {
    "slug": "servicem8",
    "name": "Servicem8",
    "category": "other",
    "file": "servicem8-2c57c30f.webp",
    "dark": false
  },
  {
    "slug": "servicenow",
    "name": "ServiceNow",
    "category": "other",
    "file": "servicenow-e47c653e.webp",
    "dark": false
  },
  {
    "slug": "sesmic",
    "name": "Sesmic",
    "category": "other",
    "file": "sesmic-eb046b0f.webp",
    "dark": false
  },
  {
    "slug": "sevdesk",
    "name": "Sevdesk",
    "category": "support",
    "file": "sevdesk-b42aa249.webp",
    "dark": false
  },
  {
    "slug": "sharepoint",
    "name": "SharePoint",
    "category": "development",
    "file": "sharepoint-ad459bf5.webp",
    "dark": false
  },
  {
    "slug": "shipengine",
    "name": "Shipengine",
    "category": "other",
    "file": "shipengine-d01d8547.webp",
    "dark": true
  },
  {
    "slug": "shopify",
    "name": "Shopify",
    "category": "commerce",
    "file": "shopify-547ae50f.webp",
    "dark": false
  },
  {
    "slug": "short-io",
    "name": "Short IO",
    "category": "other",
    "file": "short-io-99945b7f.webp",
    "dark": false
  },
  {
    "slug": "shortcut",
    "name": "Shortcut",
    "category": "development",
    "file": "shortcut-a52ad6b3.webp",
    "dark": false
  },
  {
    "slug": "shorten-rest",
    "name": "Shorten Rest",
    "category": "other",
    "file": "shorten-rest-bfd5d648.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "shortio",
    "name": "Shortio",
    "category": "other",
    "file": "shortio-99945b7f.webp",
    "dark": false
  },
  {
    "slug": "shortpixel",
    "name": "Shortpixel",
    "category": "other",
    "file": "shortpixel-812b95f2.webp",
    "dark": false
  },
  {
    "slug": "shotstack",
    "name": "Shotstack",
    "category": "other",
    "file": "shotstack-ecac67cb.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#25d3d0"
  },
  {
    "slug": "sidetracker",
    "name": "Sidetracker",
    "category": "other",
    "file": "sidetracker-d35bcc85.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#c41212"
  },
  {
    "slug": "signaturely",
    "name": "Signaturely",
    "category": "productivity",
    "file": "signaturely-ef13202b.webp",
    "dark": false
  },
  {
    "slug": "signpath",
    "name": "Signpath",
    "category": "productivity",
    "file": "signpath-6220d308.webp",
    "dark": false
  },
  {
    "slug": "simla-com",
    "name": "Simla Com",
    "category": "other",
    "file": "simla-com-0dd78bfa.webp",
    "dark": false
  },
  {
    "slug": "simple-analytics",
    "name": "Simple Analytics",
    "category": "data",
    "file": "simple-analytics-0a5b2764.webp",
    "dark": true
  },
  {
    "slug": "simplesat",
    "name": "Simplesat",
    "category": "other",
    "file": "simplesat-185985f7.webp",
    "dark": false
  },
  {
    "slug": "sitespeakai",
    "name": "Sitespeakai",
    "category": "ai",
    "file": "sitespeakai-bfd5d648.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "skyfire",
    "name": "Skyfire",
    "category": "other",
    "file": "skyfire-f65ff135.webp",
    "dark": true
  },
  {
    "slug": "slack",
    "name": "Slack",
    "category": "communication",
    "file": "slack-00c0f852.webp",
    "dark": false
  },
  {
    "slug": "smartrecruiters-api-key",
    "name": "Smartrecruiters Api Key",
    "category": "development",
    "file": "smartrecruiters-api-key-9a9566ab.webp",
    "dark": false
  },
  {
    "slug": "sms-alert",
    "name": "Sms Alert",
    "category": "communication",
    "file": "sms-alert-9b9450fc.webp",
    "dark": false
  },
  {
    "slug": "smtp2go",
    "name": "Smtp2go",
    "category": "communication",
    "file": "smtp2go-7793c74b.webp",
    "dark": false
  },
  {
    "slug": "smugmug",
    "name": "Smugmug",
    "category": "other",
    "file": "smugmug-92ed9a46.webp",
    "dark": false
  },
  {
    "slug": "snowflake",
    "name": "Snowflake",
    "category": "data",
    "file": "snowflake-d8a39fdf.webp",
    "dark": false
  },
  {
    "slug": "soundcloud",
    "name": "Soundcloud",
    "category": "other",
    "file": "soundcloud-a15b9026.webp",
    "dark": true
  },
  {
    "slug": "sourcegraph",
    "name": "Sourcegraph",
    "category": "other",
    "file": "sourcegraph-e95ba410.webp",
    "dark": false
  },
  {
    "slug": "splitwise",
    "name": "Splitwise",
    "category": "finance",
    "file": "splitwise-eb04ccf8.webp",
    "dark": false
  },
  {
    "slug": "spoki",
    "name": "Spoki",
    "category": "other",
    "file": "spoki-bfd5d648.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "spondyr",
    "name": "Spondyr",
    "category": "other",
    "file": "spondyr-bb740a72.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ef4b49"
  },
  {
    "slug": "spotify",
    "name": "Spotify",
    "category": "other",
    "file": "spotify-44091c81.webp",
    "dark": false
  },
  {
    "slug": "spotlightr",
    "name": "Spotlightr",
    "category": "other",
    "file": "spotlightr-a9d08171.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ef4e22"
  },
  {
    "slug": "squareup",
    "name": "Squareup",
    "category": "commerce",
    "file": "squareup-7ddef1ab.webp",
    "dark": false
  },
  {
    "slug": "sslmate-cert-spotter-api",
    "name": "Sslmate Cert Spotter Api",
    "category": "development",
    "file": "sslmate-cert-spotter-api-7fc89802.webp",
    "dark": true
  },
  {
    "slug": "stackexchange",
    "name": "Stackexchange",
    "category": "other",
    "file": "stackexchange-18d51418.webp",
    "dark": false
  },
  {
    "slug": "stannp",
    "name": "Stannp",
    "category": "other",
    "file": "stannp-c56667a4.webp",
    "dark": false
  },
  {
    "slug": "starshipit",
    "name": "Starshipit",
    "category": "other",
    "file": "starshipit-a96c44a4.webp",
    "dark": false
  },
  {
    "slug": "starton",
    "name": "Starton",
    "category": "other",
    "file": "starton-47f1fa05.webp",
    "dark": false
  },
  {
    "slug": "statuscake",
    "name": "Statuscake",
    "category": "other",
    "file": "statuscake-e105f6fb.webp",
    "dark": false
  },
  {
    "slug": "storeganise",
    "name": "Storeganise",
    "category": "commerce",
    "file": "storeganise-3c6f7a1b.webp",
    "dark": false
  },
  {
    "slug": "storerocket",
    "name": "Storerocket",
    "category": "commerce",
    "file": "storerocket-5c4c5647.webp",
    "dark": false
  },
  {
    "slug": "stormglass-io",
    "name": "Stormglass IO",
    "category": "other",
    "file": "stormglass-io-56648796.webp",
    "dark": false
  },
  {
    "slug": "storyblok",
    "name": "Storyblok",
    "category": "other",
    "file": "storyblok-5a6fe2c6.svg",
    "dark": true
  },
  {
    "slug": "strava",
    "name": "Strava",
    "category": "other",
    "file": "strava-ff000a3d.webp",
    "dark": false
  },
  {
    "slug": "streamtime",
    "name": "Streamtime",
    "category": "other",
    "file": "streamtime-3839369f.webp",
    "dark": true
  },
  {
    "slug": "stripe",
    "name": "Stripe",
    "category": "finance",
    "file": "stripe-d549379f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#635bff"
  },
  {
    "slug": "supabase",
    "name": "Supabase",
    "category": "development",
    "file": "supabase-f1a13a30.webp",
    "dark": false
  },
  {
    "slug": "superchat",
    "name": "Superchat",
    "category": "communication",
    "file": "superchat-4c604500.webp",
    "dark": true
  },
  {
    "slug": "supportbee",
    "name": "Supportbee",
    "category": "support",
    "file": "supportbee-bfd5d648.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "supportivekoala",
    "name": "Supportivekoala",
    "category": "support",
    "file": "supportivekoala-6666ff10.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#e3a484"
  },
  {
    "slug": "survey-monkey",
    "name": "Survey Monkey",
    "category": "productivity",
    "file": "survey-monkey-78292d9b.webp",
    "dark": false
  },
  {
    "slug": "surveymonkey",
    "name": "SurveyMonkey",
    "category": "productivity",
    "file": "surveymonkey-ffe4ac13.webp",
    "dark": false
  },
  {
    "slug": "svix",
    "name": "Svix",
    "category": "other",
    "file": "svix-b996ef90.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#2c70ff"
  },
  {
    "slug": "sympla",
    "name": "Sympla",
    "category": "other",
    "file": "sympla-d38ea380.webp",
    "dark": false
  },
  {
    "slug": "synthflow-ai",
    "name": "Synthflow AI",
    "category": "ai",
    "file": "synthflow-ai-58c8b2fc.webp",
    "dark": false
  },
  {
    "slug": "taggun",
    "name": "Taggun",
    "category": "other",
    "file": "taggun-bd7d4e03.webp",
    "dark": false
  },
  {
    "slug": "tapfiliate",
    "name": "Tapfiliate",
    "category": "other",
    "file": "tapfiliate-b4c2ca25.webp",
    "dark": true
  },
  {
    "slug": "tapform",
    "name": "Tapform",
    "category": "productivity",
    "file": "tapform-dbb5fdf9.webp",
    "dark": false
  },
  {
    "slug": "tapformio",
    "name": "Tapformio",
    "category": "productivity",
    "file": null,
    "dark": false
  },
  {
    "slug": "taskade",
    "name": "Taskade",
    "category": "productivity",
    "file": "taskade-4103a48a.webp",
    "dark": false
  },
  {
    "slug": "tavily",
    "name": "Tavily",
    "category": "search",
    "file": "tavily-61fc7701.webp",
    "dark": false
  },
  {
    "slug": "taxjar",
    "name": "Taxjar",
    "category": "finance",
    "file": "taxjar-56440906.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "teamcamp",
    "name": "Teamcamp",
    "category": "other",
    "file": "teamcamp-dd09dfbe.webp",
    "dark": true
  },
  {
    "slug": "telegram",
    "name": "Telegram",
    "category": "communication",
    "file": "telegram-694f175c.webp",
    "dark": false
  },
  {
    "slug": "telnyx",
    "name": "Telnyx",
    "category": "other",
    "file": "telnyx-56440906.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "teltel",
    "name": "Teltel",
    "category": "other",
    "file": "teltel-7f4403a0.webp",
    "dark": false
  },
  {
    "slug": "terminus",
    "name": "Terminus",
    "category": "other",
    "file": "terminus-2b4d9092.webp",
    "dark": false
  },
  {
    "slug": "textit",
    "name": "Textit",
    "category": "other",
    "file": "textit-56440906.svg",
    "dark": false,
    "wordmark": true,
    "tint": null
  },
  {
    "slug": "textrazor",
    "name": "Textrazor",
    "category": "other",
    "file": "textrazor-b8860028.webp",
    "dark": false
  },
  {
    "slug": "thanks-io",
    "name": "Thanks IO",
    "category": "other",
    "file": "thanks-io-87f44633.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#cf422a"
  },
  {
    "slug": "the-odds-api",
    "name": "The Odds Api",
    "category": "development",
    "file": "the-odds-api-88546dbc.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#4a86e8"
  },
  {
    "slug": "tiktok",
    "name": "Tiktok",
    "category": "marketing",
    "file": "tiktok-7c37d9fa.webp",
    "dark": true
  },
  {
    "slug": "time-tracker-by-ebillity",
    "name": "Time Tracker BY Ebillity",
    "category": "other",
    "file": "time-tracker-by-ebillity-2d256ccf.webp",
    "dark": false
  },
  {
    "slug": "timecamp",
    "name": "Timecamp",
    "category": "other",
    "file": "timecamp-09aa62a4.webp",
    "dark": false
  },
  {
    "slug": "timekit",
    "name": "Timekit",
    "category": "other",
    "file": "timekit-9790e534.webp",
    "dark": false
  },
  {
    "slug": "timelines",
    "name": "Timelines",
    "category": "other",
    "file": "timelines-9f3b3ebc.webp",
    "dark": false
  },
  {
    "slug": "timelink",
    "name": "Timelink",
    "category": "other",
    "file": "timelink-4f41610d.webp",
    "dark": false
  },
  {
    "slug": "timely",
    "name": "Timely",
    "category": "other",
    "file": "timely-ee5cc40a.webp",
    "dark": false
  },
  {
    "slug": "tinypng",
    "name": "Tinypng",
    "category": "other",
    "file": "tinypng-2ce75d72.webp",
    "dark": false
  },
  {
    "slug": "tinyurl",
    "name": "TinyURL",
    "category": "other",
    "file": "tinyurl-b5916d25.webp",
    "dark": false
  },
  {
    "slug": "tisane",
    "name": "Tisane",
    "category": "other",
    "file": "tisane-80895abf.webp",
    "dark": false
  },
  {
    "slug": "tisane-ai",
    "name": "Tisane AI",
    "category": "ai",
    "file": "tisane-ai-419da720.webp",
    "dark": false
  },
  {
    "slug": "todoist",
    "name": "Todoist",
    "category": "productivity",
    "file": "todoist-4ffca9b7.webp",
    "dark": false
  },
  {
    "slug": "toggl",
    "name": "Toggl",
    "category": "other",
    "file": "toggl-af6de99c.webp",
    "dark": true
  },
  {
    "slug": "token-metrics",
    "name": "Token Metrics",
    "category": "other",
    "file": "token-metrics-74d96a84.webp",
    "dark": false
  },
  {
    "slug": "tomtom",
    "name": "Tomtom",
    "category": "other",
    "file": "tomtom-ce8596c5.svg",
    "dark": true
  },
  {
    "slug": "toneden",
    "name": "Toneden",
    "category": "other",
    "file": "toneden-8e3b8d24.webp",
    "dark": false
  },
  {
    "slug": "tpscheck",
    "name": "Tpscheck",
    "category": "other",
    "file": "tpscheck-8dc18913.webp",
    "dark": false
  },
  {
    "slug": "trello",
    "name": "Trello",
    "category": "productivity",
    "file": "trello-530e6b1a.webp",
    "dark": false
  },
  {
    "slug": "triggercmd",
    "name": "Triggercmd",
    "category": "other",
    "file": "triggercmd-2961ae76.svg",
    "dark": true
  },
  {
    "slug": "turbot-pipes",
    "name": "Turbot Pipes",
    "category": "other",
    "file": "turbot-pipes-e79ed275.webp",
    "dark": false
  },
  {
    "slug": "turso",
    "name": "Turso",
    "category": "other",
    "file": "turso-a0b756a7.webp",
    "dark": false
  },
  {
    "slug": "twilio",
    "name": "Twilio",
    "category": "communication",
    "file": "twilio-76ce6c2a.webp",
    "dark": false
  },
  {
    "slug": "twitch",
    "name": "Twitch",
    "category": "other",
    "file": "twitch-d76f454f.webp",
    "dark": false
  },
  {
    "slug": "twitter",
    "name": "X",
    "category": "marketing",
    "file": "twitter-2b0b0772.webp",
    "dark": true
  },
  {
    "slug": "typeform",
    "name": "Typeform",
    "category": "productivity",
    "file": "typeform-4fac2873.webp",
    "dark": true
  },
  {
    "slug": "typefully",
    "name": "Typefully",
    "category": "other",
    "file": "typefully-9f4ac2b6.webp",
    "dark": false
  },
  {
    "slug": "typless",
    "name": "Typless",
    "category": "other",
    "file": "typless-27335093.webp",
    "dark": false
  },
  {
    "slug": "u301",
    "name": "U301",
    "category": "other",
    "file": "u301-11dd1fad.webp",
    "dark": false
  },
  {
    "slug": "ultrahuman",
    "name": "Ultrahuman",
    "category": "other",
    "file": "ultrahuman-8bd31973.webp",
    "dark": false
  },
  {
    "slug": "unione",
    "name": "Unione",
    "category": "other",
    "file": "unione-69eca269.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ff9c24"
  },
  {
    "slug": "uptimerobot",
    "name": "Uptimerobot",
    "category": "other",
    "file": "uptimerobot-837f41bd.webp",
    "dark": false
  },
  {
    "slug": "userlist",
    "name": "Userlist",
    "category": "other",
    "file": "userlist-c72cf7da.webp",
    "dark": false
  },
  {
    "slug": "v0",
    "name": "V0",
    "category": "other",
    "file": "v0-6782284c.webp",
    "dark": true
  },
  {
    "slug": "venly",
    "name": "Venly",
    "category": "other",
    "file": "venly-768cacf9.webp",
    "dark": false
  },
  {
    "slug": "vercel",
    "name": "Vercel",
    "category": "development",
    "file": "vercel-7e46cf57.webp",
    "dark": true
  },
  {
    "slug": "verifiedemail",
    "name": "Verifiedemail",
    "category": "communication",
    "file": "verifiedemail-bd0f676f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#f9bb30"
  },
  {
    "slug": "vero",
    "name": "Vero",
    "category": "other",
    "file": "vero-f4e0ee05.webp",
    "dark": true
  },
  {
    "slug": "virustotal",
    "name": "Virustotal",
    "category": "other",
    "file": "virustotal-d9a73dde.webp",
    "dark": false
  },
  {
    "slug": "visme",
    "name": "Visme",
    "category": "other",
    "file": "visme-9cdb14f2.webp",
    "dark": false
  },
  {
    "slug": "waboxapp",
    "name": "Waboxapp",
    "category": "storage",
    "file": "waboxapp-ca1e655b.webp",
    "dark": false
  },
  {
    "slug": "waiverfile",
    "name": "Waiverfile",
    "category": "ai",
    "file": "waiverfile-d60d8729.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#005dac"
  },
  {
    "slug": "wakatime",
    "name": "Wakatime",
    "category": "other",
    "file": "wakatime-cdabe82f.webp",
    "dark": true
  },
  {
    "slug": "wati",
    "name": "Wati",
    "category": "other",
    "file": "wati-ed728b74.webp",
    "dark": false
  },
  {
    "slug": "wave-accounting",
    "name": "Wave Accounting",
    "category": "finance",
    "file": "wave-accounting-733fc300.webp",
    "dark": false
  },
  {
    "slug": "weathermap",
    "name": "Weathermap",
    "category": "other",
    "file": "weathermap-1785e5de.webp",
    "dark": false
  },
  {
    "slug": "webex",
    "name": "Webex",
    "category": "other",
    "file": "webex-189f4247.webp",
    "dark": false
  },
  {
    "slug": "webflow",
    "name": "Webflow",
    "category": "productivity",
    "file": "webflow-f0b155d8.webp",
    "dark": false
  },
  {
    "slug": "webscraping-ai",
    "name": "Webscraping AI",
    "category": "development",
    "file": "webscraping-ai-0959c26e.webp",
    "dark": false
  },
  {
    "slug": "webvizio",
    "name": "Webvizio",
    "category": "other",
    "file": "webvizio-55a26fd4.webp",
    "dark": false
  },
  {
    "slug": "whatsapp",
    "name": "WhatsApp",
    "category": "communication",
    "file": "whatsapp-2568b29a.webp",
    "dark": false
  },
  {
    "slug": "whautomate",
    "name": "Whautomate",
    "category": "other",
    "file": "whautomate-f980594f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#02006d"
  },
  {
    "slug": "winston-ai",
    "name": "Winston AI",
    "category": "ai",
    "file": "winston-ai-f8659193.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#3452fe"
  },
  {
    "slug": "withmoxie",
    "name": "Withmoxie",
    "category": "other",
    "file": "withmoxie-da2f8ba3.webp",
    "dark": false
  },
  {
    "slug": "wiz",
    "name": "Wiz",
    "category": "other",
    "file": "wiz-dc1b3a11.webp",
    "dark": false
  },
  {
    "slug": "wolfram-alpha-api",
    "name": "Wolfram Alpha Api",
    "category": "development",
    "file": "wolfram-alpha-api-53ccb024.webp",
    "dark": false
  },
  {
    "slug": "woodpecker-co",
    "name": "Woodpecker CO",
    "category": "other",
    "file": "woodpecker-co-c1222bdf.webp",
    "dark": true
  },
  {
    "slug": "workable",
    "name": "Workable",
    "category": "hr",
    "file": "workable-752b9dad.webp",
    "dark": false
  },
  {
    "slug": "workday",
    "name": "Workday",
    "category": "hr",
    "file": "workday-edc22ccc.webp",
    "dark": false
  },
  {
    "slug": "workiom",
    "name": "Workiom",
    "category": "other",
    "file": "workiom-1f9b972f.webp",
    "dark": true
  },
  {
    "slug": "workspace",
    "name": "Workspace",
    "category": "other",
    "file": "workspace-bfece923.webp",
    "dark": true
  },
  {
    "slug": "wrike",
    "name": "Wrike",
    "category": "productivity",
    "file": "wrike-f7ae571c.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#08cf65"
  },
  {
    "slug": "xero",
    "name": "Xero",
    "category": "finance",
    "file": "xero-9496e4a8.webp",
    "dark": false
  },
  {
    "slug": "yahoo",
    "name": "Yahoo",
    "category": "other",
    "file": "yahoo-82bb9f8c.webp",
    "dark": false
  },
  {
    "slug": "yandex",
    "name": "Yandex",
    "category": "other",
    "file": "yandex-a73fd15b.webp",
    "dark": false
  },
  {
    "slug": "yelp",
    "name": "Yelp",
    "category": "other",
    "file": "yelp-3f8a9ba7.webp",
    "dark": false
  },
  {
    "slug": "ynab",
    "name": "Ynab",
    "category": "other",
    "file": "ynab-af17bbd7.webp",
    "dark": false
  },
  {
    "slug": "you",
    "name": "You",
    "category": "other",
    "file": "you-18d3e73f.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#0771fd"
  },
  {
    "slug": "youtube",
    "name": "YouTube",
    "category": "marketing",
    "file": "youtube-0ef0d205.webp",
    "dark": false
  },
  {
    "slug": "zapier-nla",
    "name": "Zapier Nla",
    "category": "development",
    "file": "zapier-nla-8d6a20bb.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#ff4f00"
  },
  {
    "slug": "zendesk",
    "name": "Zendesk",
    "category": "support",
    "file": "zendesk-0304c1f9.webp",
    "dark": true
  },
  {
    "slug": "zenefits",
    "name": "Zenefits",
    "category": "other",
    "file": "zenefits-1d981e29.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#e14700"
  },
  {
    "slug": "zenrows",
    "name": "Zenrows",
    "category": "other",
    "file": "zenrows-ce990ac1.webp",
    "dark": false
  },
  {
    "slug": "zenserp",
    "name": "Zenserp",
    "category": "search",
    "file": "zenserp-268e30b4.webp",
    "dark": false
  },
  {
    "slug": "zeplin",
    "name": "Zeplin",
    "category": "other",
    "file": "zeplin-9fa0902f.webp",
    "dark": false
  },
  {
    "slug": "zerobounce",
    "name": "Zerobounce",
    "category": "other",
    "file": "zerobounce-2cd9eace.webp",
    "dark": false
  },
  {
    "slug": "zoho",
    "name": "Zoho",
    "category": "crm",
    "file": "zoho-e276ca98.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#cd2232"
  },
  {
    "slug": "zoho-bigin",
    "name": "Zoho Bigin",
    "category": "crm",
    "file": "zoho-bigin-67c8bb28.webp",
    "dark": false
  },
  {
    "slug": "zoho-books",
    "name": "Zoho Books",
    "category": "crm",
    "file": "zoho-books-2bed187b.webp",
    "dark": false
  },
  {
    "slug": "zoho-crm",
    "name": "Zoho Crm",
    "category": "crm",
    "file": "zoho-crm-f6ed5cd3.webp",
    "dark": false
  },
  {
    "slug": "zoho-desk",
    "name": "Zoho Desk",
    "category": "crm",
    "file": "zoho-desk-e6769881.webp",
    "dark": false
  },
  {
    "slug": "zoho-inventory",
    "name": "Zoho Inventory",
    "category": "crm",
    "file": "zoho-inventory-b5bb2606.webp",
    "dark": false
  },
  {
    "slug": "zoho-invoice",
    "name": "Zoho Invoice",
    "category": "communication",
    "file": "zoho-invoice-6f352c1e.webp",
    "dark": false
  },
  {
    "slug": "zoho-mail",
    "name": "Zoho Mail",
    "category": "communication",
    "file": "zoho-mail-dfc98e07.webp",
    "dark": false
  },
  {
    "slug": "zoom",
    "name": "Zoom",
    "category": "communication",
    "file": "zoom-26e7848c.webp",
    "dark": false
  },
  {
    "slug": "zylvie",
    "name": "Zylvie",
    "category": "other",
    "file": "zylvie-fa2a31e7.webp",
    "dark": false
  },
  {
    "slug": "zyte-api",
    "name": "Zyte Api",
    "category": "development",
    "file": "zyte-api-00a7bf8d.svg",
    "dark": false,
    "wordmark": true,
    "tint": "#b02cce"
  }
];
