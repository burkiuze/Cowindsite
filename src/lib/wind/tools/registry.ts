import "server-only";
import type { Permission } from "../../workspace/rbac";

/**
 * Tool registry.
 *
 * A tool is a capability Wind can invoke against a connected system. Every tool
 * declares the permission it needs and whether it changes anything outside
 * Cowind — that flag is what forces a human approval before execution.
 *
 * Nothing here fakes a result. If the integration behind a tool is not
 * connected, the tool is not runnable and Wind is told so explicitly.
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
  /** JSON-ish parameter description, used when briefing Wind. */
  parameters: Record<string, string>;
}

export const TOOLS: ToolDefinition[] = [
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
