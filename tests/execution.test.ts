import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { executeTool, isWired } from "@/lib/wind/tools/execute";
import { findTool } from "@/lib/wind/tools/registry";

/**
 * An approval that says "executed" must mean something ran. These guard the
 * seam where a claim could quietly replace a receipt.
 */

const ENDPOINT = "INTEGRATION_ENDPOINT_GOOGLE_CALENDAR";

beforeEach(() => {
  delete process.env[ENDPOINT];
  vi.restoreAllMocks();
});

afterEach(() => {
  delete process.env[ENDPOINT];
});

describe("executeTool", () => {
  it("says plainly that nothing was sent when no endpoint is wired", async () => {
    const outcome = await executeTool({
      toolId: "google-calendar.create_event",
      integrationId: "google-calendar",
      payload: "Meeting at 18:00",
      actor: "Burak Şimşek",
      traceId: "t1",
    });

    expect(outcome.status).toBe("not_wired");
    expect(outcome.receipt).toContain("nothing was sent");
  });

  it("calls the configured endpoint and receipts the real result", async () => {
    process.env[ENDPOINT] = "https://actions.example.test/calendar";
    const fetchMock = vi.fn(async () => new Response("event_129", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await executeTool({
      toolId: "google-calendar.create_event",
      integrationId: "google-calendar",
      payload: "Meeting at 18:00",
      actor: "Burak Şimşek",
      traceId: "t2",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://actions.example.test/calendar");
    const sent = JSON.parse(String(init.body));
    expect(sent.tool).toBe("google-calendar.create_event");
    expect(sent.approvedBy).toBe("Burak Şimşek");
    expect(sent.payload).toBe("Meeting at 18:00");

    expect(outcome.status).toBe("executed");
    expect(outcome.receipt).toContain("Google Calendar");
    expect(outcome.receipt).toContain("event_129");
  });

  it("does not claim success when the service refuses", async () => {
    process.env[ENDPOINT] = "https://actions.example.test/calendar";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));

    const outcome = await executeTool({
      toolId: "google-calendar.create_event",
      integrationId: "google-calendar",
      payload: "x",
      actor: "Someone",
      traceId: "t3",
    });

    expect(outcome.status).toBe("failed");
    expect(outcome.receipt).not.toContain("Executed");
  });

  it("does not claim success when the service cannot be reached", async () => {
    process.env[ENDPOINT] = "https://actions.example.test/calendar";
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("connect ECONNREFUSED"); }));

    const outcome = await executeTool({
      toolId: "google-calendar.create_event",
      integrationId: "google-calendar",
      payload: "x",
      actor: "Someone",
      traceId: "t4",
    });

    expect(outcome.status).toBe("failed");
    expect(outcome.receipt).toContain("could not be reached");
  });

  it("reports wiring per integration", () => {
    expect(isWired("google-calendar")).toBe(false);
    process.env[ENDPOINT] = "https://actions.example.test/calendar";
    expect(isWired("google-calendar")).toBe(true);
    expect(isWired("gmail")).toBe(false);
    expect(isWired(undefined)).toBe(false);
  });
});

describe("registry", () => {
  it("marks every write tool as needing approval", () => {
    const writes = ["google-calendar.create_event", "gmail.send_email", "slack.post_message", "linkedin.post_update"];
    for (const id of writes) {
      const tool = findTool(id);
      expect(tool, `${id} is missing`).toBeDefined();
      expect(tool!.effect).toBe("write");
      expect(tool!.approvalDefault).toBe(true);
    }
  });

  it("leaves read tools free of an approval prompt", () => {
    expect(findTool("google-calendar.list_events")!.approvalDefault).toBe(false);
    expect(findTool("github.list_pull_requests")!.approvalDefault).toBe(false);
  });
});

describe("multi-step actions", () => {
  it("declares every publishing tool as a write that needs approval", () => {
    for (const id of ["higgsfield.create_video", "youtube.upload_video", "twitter.post_tweet"]) {
      const tool = findTool(id);
      expect(tool, `${id} is missing`).toBeDefined();
      expect(tool!.effect).toBe("write");
      expect(tool!.approvalDefault).toBe(true);
    }
  });

  it("keeps the new lookups read-only", () => {
    expect(findTool("github.list_issues")!.effect).toBe("read");
    expect(findTool("github.list_issues")!.approvalDefault).toBe(false);
  });
});
