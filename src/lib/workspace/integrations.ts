import type { IntegrationCategory, IntegrationConnection, IntegrationDefinition } from "./types";

/**
 * Integration catalogue.
 *
 * Honesty rule: Cowind never pretends. An integration is "Connected" only when
 * real credentials for it exist in the server environment. Everything else is
 * shown as "Available — not connected", and Wind is told in its system prompt
 * which tools actually exist so it cannot claim to have used one.
 */

export const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  development: "Development",
  communication: "Communication",
  productivity: "Productivity",
  storage: "Storage",
  crm: "CRM",
  commerce: "Commerce",
  data: "Data",
};

export const INTEGRATIONS: IntegrationDefinition[] = [
  // --- Development ---------------------------------------------------------
  {
    id: "github",
    name: "GitHub",
    category: "development",
    description: "Repositories, pull requests, issues and review activity.",
    implemented: true,
    requiredEnv: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY"],
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "development",
    description: "Projects, merge requests and pipeline status.",
    implemented: false,
    requiredEnv: ["GITLAB_TOKEN"],
  },
  {
    id: "linear",
    name: "Linear",
    category: "development",
    description: "Issues, cycles and project velocity.",
    implemented: true,
    requiredEnv: ["LINEAR_API_KEY"],
  },
  {
    id: "jira",
    name: "Jira",
    category: "development",
    description: "Boards, sprints and issue workflows.",
    implemented: false,
    requiredEnv: ["JIRA_HOST", "JIRA_TOKEN"],
  },
  {
    id: "figma",
    name: "Figma",
    category: "development",
    description: "Design files, components and comment threads.",
    implemented: false,
    requiredEnv: ["FIGMA_TOKEN"],
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "development",
    description: "Postgres data, auth users and edge functions.",
    implemented: false,
    requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  },

  // --- Communication -------------------------------------------------------
  {
    id: "slack",
    name: "Slack",
    category: "communication",
    description: "Channels, threads and direct messages.",
    implemented: true,
    requiredEnv: ["SLACK_BOT_TOKEN"],
  },
  {
    id: "discord",
    name: "Discord",
    category: "communication",
    description: "Servers, channels and community activity.",
    implemented: false,
    requiredEnv: ["DISCORD_BOT_TOKEN"],
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    category: "communication",
    description: "Teams, channels and meeting notes.",
    implemented: false,
    requiredEnv: ["MS_TEAMS_CLIENT_ID", "MS_TEAMS_CLIENT_SECRET"],
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "communication",
    description: "Threads, drafts and scheduled sends.",
    implemented: true,
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "outlook",
    name: "Outlook",
    category: "communication",
    description: "Mail, calendar and contacts.",
    implemented: false,
    requiredEnv: ["MS_CLIENT_ID", "MS_CLIENT_SECRET"],
  },
  {
    id: "intercom",
    name: "Intercom",
    category: "communication",
    description: "Customer conversations and inbox rules.",
    implemented: false,
    requiredEnv: ["INTERCOM_TOKEN"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    category: "communication",
    description: "Support tickets, macros and SLAs.",
    implemented: false,
    requiredEnv: ["ZENDESK_SUBDOMAIN", "ZENDESK_TOKEN"],
  },

  // --- Productivity --------------------------------------------------------
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "productivity",
    description: "Availability, meetings and agendas.",
    implemented: true,
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "google-docs",
    name: "Google Docs",
    category: "productivity",
    description: "Documents Wind can read, draft and revise.",
    implemented: false,
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    category: "productivity",
    description: "Spreadsheets, ranges and formulas.",
    implemented: false,
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "notion",
    name: "Notion",
    category: "productivity",
    description: "Databases, pages and team wikis.",
    implemented: true,
    requiredEnv: ["NOTION_TOKEN"],
  },
  {
    id: "trello",
    name: "Trello",
    category: "productivity",
    description: "Boards, lists and cards.",
    implemented: false,
    requiredEnv: ["TRELLO_KEY", "TRELLO_TOKEN"],
  },
  {
    id: "asana",
    name: "Asana",
    category: "productivity",
    description: "Projects, tasks and portfolios.",
    implemented: false,
    requiredEnv: ["ASANA_TOKEN"],
  },

  // --- Storage -------------------------------------------------------------
  {
    id: "google-drive",
    name: "Google Drive",
    category: "storage",
    description: "Files and shared drives as workspace knowledge.",
    implemented: false,
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    category: "storage",
    description: "Folders, file history and shared links.",
    implemented: false,
    requiredEnv: ["DROPBOX_TOKEN"],
  },
  {
    id: "onedrive",
    name: "OneDrive",
    category: "storage",
    description: "Personal and organisation file storage.",
    implemented: false,
    requiredEnv: ["MS_CLIENT_ID", "MS_CLIENT_SECRET"],
  },

  // --- CRM -----------------------------------------------------------------
  {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "Contacts, deals and pipeline stages.",
    implemented: false,
    requiredEnv: ["HUBSPOT_TOKEN"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Accounts, opportunities and forecasts.",
    implemented: false,
    requiredEnv: ["SALESFORCE_CLIENT_ID", "SALESFORCE_CLIENT_SECRET"],
  },

  // --- Commerce ------------------------------------------------------------
  {
    id: "stripe",
    name: "Stripe",
    category: "commerce",
    description: "Revenue, subscriptions and payment health.",
    implemented: true,
    requiredEnv: ["STRIPE_SECRET_KEY"],
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "commerce",
    description: "Orders, products and store performance.",
    implemented: false,
    requiredEnv: ["SHOPIFY_STORE", "SHOPIFY_ACCESS_TOKEN"],
  },

  // --- Data ----------------------------------------------------------------
  {
    id: "airtable",
    name: "Airtable",
    category: "data",
    description: "Bases, tables and structured records.",
    implemented: false,
    requiredEnv: ["AIRTABLE_TOKEN"],
  },
];

export function integrationById(id: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find((integration) => integration.id === id);
}

export function byCategory(): Array<{ category: IntegrationCategory; items: IntegrationDefinition[] }> {
  const categories = Object.keys(CATEGORY_LABEL) as IntegrationCategory[];
  return categories.map((category) => ({
    category,
    items: INTEGRATIONS.filter((integration) => integration.category === category),
  }));
}

/**
 * Resolve the true status of an integration from the server environment.
 * Never called from the browser — the result is passed down as plain data.
 */
export function resolveStatus(definition: IntegrationDefinition): IntegrationConnection["status"] {
  if (!definition.implemented) return "available";
  const configured = definition.requiredEnv.every((name) => {
    const value = process.env[name];
    return typeof value === "string" && value.trim().length > 0;
  });
  return configured ? "connected" : "not_configured";
}

export const STATUS_LABEL: Record<IntegrationConnection["status"], string> = {
  connected: "Connected",
  available: "Available",
  not_configured: "Not connected",
  error: "Needs attention",
};
