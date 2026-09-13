import "server-only";
import type { Permission } from "../../workspace/rbac";

/**
 * Tool registry.
 *
 * A tool is a capability Navio can invoke against a connected system. Every tool
 * declares the permission it needs and whether it changes anything outside
 * Navio — that flag is what forces a human approval before execution.
 *
 * Nothing here fakes a result. If the integration behind a tool is not
 * connected, the tool is not runnable and Navio is told so explicitly.
 */

export type ToolEffect = "read" | "write";

export interface ToolDefinition {
  id: string;
  /** Integration this tool belongs to, e.g. "github". */
  integrationId: string;
  name: string;
  description: string;
  effect: ToolEffect;
  /** Permission the *user* must hold. An agent never exceeds its initiator. */
  requiredPermission: Permission;
  /** Write tools always need approval unless an operator lowers it explicitly. */
  approvalDefault: boolean;
  /** JSON-ish parameter description, used when briefing Navio. */
  parameters: Record<string, string>;
}

export const TOOLS: ToolDefinition[] = [
  // --- reads: what Navio may look at while it works -------------------------
  {
    id: "gmail.list_threads",
    integrationId: "gmail",
    name: "Read recent threads",
    description: "Read recent mail threads matching a query.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { query: "gmail search syntax", limit: "integer" },
  },
  {
    id: "linkedin.read_page_activity",
    integrationId: "linkedin",
    name: "Read page activity",
    description: "Read recent company page posts and their engagement.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { period: "week | month" },
  },
  {
    id: "notion.search",
    integrationId: "notion",
    name: "Search pages",
    description: "Search pages and databases the workspace can see.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { query: "string" },
  },
  {
    id: "google-meet.create_link",
    integrationId: "google-meet",
    name: "Create a meeting link",
    description: "Create a conferencing link for an event.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { title: "string", start: "ISO datetime" },
  },
  {
    id: "github.list_pull_requests",
    integrationId: "github",
    name: "List pull requests",
    description: "Read open pull requests for a repository.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { repository: "owner/name", state: "open | closed | all" },
  },
  {
    id: "github.comment_on_pull_request",
    integrationId: "github",
    name: "Comment on a pull request",
    description: "Post a comment on a pull request.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { repository: "owner/name", number: "integer", body: "markdown" },
  },
  {
    id: "slack.post_message",
    integrationId: "slack",
    name: "Post a message",
    description: "Send a message to a channel.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { channel: "#channel", text: "markdown" },
  },
  {
    id: "gmail.send_email",
    integrationId: "gmail",
    name: "Send an email",
    description: "Send an email from the connected mailbox.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { to: "email", subject: "string", body: "markdown" },
  },
  {
    id: "google-calendar.create_event",
    integrationId: "google-calendar",
    name: "Create a calendar event",
    description: "Create an event and invite its attendees.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: {
      title: "string",
      start: "ISO datetime",
      end: "ISO datetime",
      attendees: "email[]",
      agenda: "markdown",
    },
  },
  {
    id: "linear.list_issues",
    integrationId: "linear",
    name: "Read the cycle",
    description: "Read issues in the current cycle and what is at risk.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { team: "string", cycle: "current | next" },
  },
  {
    id: "youtube.list_videos",
    integrationId: "youtube",
    name: "Read the channel",
    description: "Read recent uploads and their performance.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { limit: "integer" },
  },
  {
    id: "higgsfield.create_video",
    integrationId: "higgsfield",
    name: "Generate a video",
    description: "Render a short video from a brief, then return its asset link.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { brief: "markdown", aspect: "16:9 | 9:16 | 1:1", seconds: "integer" },
  },
  {
    id: "youtube.upload_video",
    integrationId: "youtube",
    name: "Upload to the channel",
    description: "Upload a video with its title, description and visibility.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { asset: "url", title: "string", description: "markdown", visibility: "public | unlisted" },
  },
  {
    id: "twitter.post_tweet",
    integrationId: "twitter",
    name: "Post to X",
    description: "Publish a post, optionally with media attached.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { text: "string", media: "url" },
  },
  {
    id: "github.list_issues",
    integrationId: "github",
    name: "Read open issues",
    description: "Read open issues and their labels for a repository.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { repository: "owner/name", labels: "string[]" },
  },
  {
    id: "linkedin.post_update",
    integrationId: "linkedin",
    name: "Post an update",
    description: "Publish a post to the company page.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { text: "markdown", visibility: "public | connections" },
  },
  {
    id: "google-calendar.list_events",
    integrationId: "google-calendar",
    name: "List calendar events",
    description: "Read events in a date range.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { from: "ISO date", to: "ISO date" },
  },
  {
    id: "linear.create_issue",
    integrationId: "linear",
    name: "Create an issue",
    description: "Create an issue in a team's backlog.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { team: "string", title: "string", description: "markdown" },
  },
  {
    id: "notion.create_page",
    integrationId: "notion",
    name: "Create a page",
    description: "Create a page in a database.",
    effect: "write",
    requiredPermission: "integrations:use",
    approvalDefault: true,
    parameters: { database: "string", title: "string", content: "markdown" },
  },
  {
    id: "quickbooks.read_ledger",
    integrationId: "quickbooks",
    name: "Read the ledger",
    description: "Read balances, spend by category, open invoices and bills.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { period: "month | quarter | year", scope: "string" },
  },
  {
    id: "stripe.read_metrics",
    integrationId: "stripe",
    name: "Read revenue metrics",
    description: "Read subscription and revenue figures.",
    effect: "read",
    requiredPermission: "integrations:use",
    approvalDefault: false,
    parameters: { period: "month | quarter | year" },
  },
];

export function toolsForIntegration(integrationId: string): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.integrationId === integrationId);
}

export function findTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}
