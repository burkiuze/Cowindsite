import "server-only";
import { findTool, type ToolDefinition } from "./registry";
import { integrationById } from "../../workspace/integrations";
import { LIMITS } from "../config";

/**
 * Tool execution.
 *
 * An approved action only counts as done when something actually ran. Each
 * integration is reached through an endpoint the operator configures —
 * `INTEGRATION_ENDPOINT_<SLUG>` — which receives the tool id and the approved
 * payload and performs the real call for that service.
 *
 * If no endpoint is wired, nothing is invented: the caller is told plainly that
 * the decision was recorded and nothing was sent. That is the difference
 * between a receipt and a claim.
 */

export type ExecutionOutcome =
  | { status: "executed"; receipt: string }
  | { status: "not_wired"; receipt: string }
  | { status: "failed"; receipt: string };

function endpointFor(integrationId: string): string | undefined {
  const key = `INTEGRATION_ENDPOINT_${integrationId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function isWired(integrationId: string | undefined): boolean {
  return Boolean(integrationId && endpointFor(integrationId));
}

export async function executeTool(options: {
  toolId?: string;
  integrationId?: string;
  payload: string;
  actor: string;
  traceId: string;
}): Promise<ExecutionOutcome> {
  const integrationId = options.integrationId ?? findTool(options.toolId ?? "")?.integrationId;
  const integration = integrationId ? integrationById(integrationId) : undefined;
  const label = integration?.name ?? "the connected service";

  const endpoint = integrationId ? endpointFor(integrationId) : undefined;
  if (!endpoint) {
    return {
      status: "not_wired",
      receipt: integration
        ? `Approved and recorded. ${label} has no action endpoint configured on this deployment, so nothing was sent.`
        : "Approved and recorded. This action has no connected system behind it, so nothing was sent.",
    };
  }

  const tool: ToolDefinition | undefined = findTool(options.toolId ?? "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(20_000, LIMITS.requestTimeoutMs));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: options.toolId ?? null,
        integration: integrationId,
        approvedBy: options.actor,
        payload: options.payload,
        at: new Date().toISOString(),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "failed",
        receipt: `Approved, but ${label} refused the action. Nothing was changed there; the attempt is recorded.`,
      };
    }

    // Services may answer with an id or a link; surface it verbatim when short.
    const body = (await response.text()).trim().slice(0, 200);
    const detail = body && body.length < 160 ? ` Response: ${body}.` : "";

    return {
      status: "executed",
      receipt: `Executed against ${label}${tool ? ` via ${tool.name.toLowerCase()}` : ""} at ${new Date().toISOString()}.${detail}`,
    };
  } catch {
    return {
      status: "failed",
      receipt: `Approved, but ${label} could not be reached. Nothing was changed there; the attempt is recorded.`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
