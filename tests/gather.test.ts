import { describe, expect, it, vi } from "vitest";
import { asContext, readableTools, type GatheredAction } from "@/lib/wind/tools/gather";

/**
 * The gather phase may only ever read, and only from services that are truly
 * reachable. These pin both halves of that.
 */

const AVAILABLE = [
  { id: "google-calendar.list_events", effect: "read", integrationId: "google-calendar" },
  { id: "google-calendar.create_event", effect: "write", integrationId: "google-calendar" },
  { id: "gmail.send_email", effect: "write", integrationId: "gmail" },
  { id: "gmail.list_threads", effect: "read", integrationId: "gmail" },
  { id: "github.list_pull_requests", effect: "read", integrationId: "github" },
];

describe("readableTools", () => {
  it("returns nothing when no integration has an endpoint wired", () => {
    expect(readableTools(AVAILABLE)).toEqual([]);
  });

  it("never offers a write tool, even on a wired integration", () => {
    vi.stubEnv("INTEGRATION_ENDPOINT_GOOGLE_CALENDAR", "https://actions.test/cal");
    vi.stubEnv("INTEGRATION_ENDPOINT_GMAIL", "https://actions.test/mail");

    const tools = readableTools(AVAILABLE);
    expect(tools.map((tool) => tool.id).sort()).toEqual(["gmail.list_threads", "google-calendar.list_events"]);
    expect(tools.every((tool) => tool.effect === "read")).toBe(true);
    expect(tools.every((tool) => tool.approvalDefault === false)).toBe(true);

    vi.unstubAllEnvs();
  });

  it("leaves out a connected service with no endpoint", () => {
    vi.stubEnv("INTEGRATION_ENDPOINT_GMAIL", "https://actions.test/mail");
    expect(readableTools(AVAILABLE).map((tool) => tool.integrationId)).toEqual(["gmail"]);
    vi.unstubAllEnvs();
  });
});

describe("asContext", () => {
  const action = (overrides: Partial<GatheredAction>): GatheredAction => ({
    id: "a1",
    integrationId: "google-calendar",
    toolId: "google-calendar.list_events",
    label: "List calendar events",
    status: "completed",
    result: "18:00 is free for all four attendees",
    at: Date.now(),
    ...overrides,
  });

  it("passes completed reads to the specialists", () => {
    const context = asContext([action({})]);
    expect(context).toContain("google-calendar.list_events");
    expect(context).toContain("18:00 is free");
  });

  it("never passes a failed read off as data", () => {
    expect(asContext([action({ status: "failed", result: "could not be reached" })])).toBe("");
  });

  it("is empty when nothing was read", () => {
    expect(asContext([])).toBe("");
  });
});
