import { beforeEach, describe, expect, it } from "vitest";
import { retrieve, visibleSources } from "@/lib/workspace/knowledge";
import { resetStore, store } from "@/lib/workspace/store";
import type { WorkspaceMember } from "@/lib/workspace/types";

const member = (overrides: Partial<WorkspaceMember> = {}): WorkspaceMember => ({
  id: "mem_test",
  workspaceId: "ws_meridian",
  userId: "usr_test",
  role: "member",
  departmentIds: ["dep_engineering"],
  joinedAt: Date.now(),
  status: "active",
  ...overrides,
});

beforeEach(() => {
  resetStore();
});

describe("scoped memory", () => {
  it("shows workspace-wide sources to everyone", () => {
    const titles = visibleSources({ member: member() }).map((source) => source.title);
    expect(titles).toContain("Security and data handling policy");
  });

  it("hides another department's knowledge from a member", () => {
    const titles = visibleSources({ member: member() }).map((source) => source.title);
    expect(titles).not.toContain("Q3 financial summary");
  });

  it("lets an admin see across departments", () => {
    const titles = visibleSources({ member: member({ role: "admin" }) }).map((source) => source.title);
    expect(titles).toContain("Q3 financial summary");
  });

  it("narrows further to an agent's own scopes", () => {
    const titles = visibleSources({
      member: member({ role: "owner", departmentIds: [] }),
      agentScopes: ["engineering"],
    }).map((source) => source.title);
    expect(titles).toContain("Platform architecture overview");
    expect(titles).not.toContain("Positioning and messaging");
  });
});

describe("retrieval", () => {
  it("finds the right source for a domain question", () => {
    const result = retrieve("What is our runway and net burn?", { member: member({ role: "admin" }) });
    expect(result.sources).toContain("Q3 financial summary");
    expect(result.text).toContain("385K");
  });

  it("returns nothing rather than leaking out of scope", () => {
    const result = retrieve("What is our runway and net burn?", { member: member() });
    expect(result.sources).not.toContain("Q3 financial summary");
  });

  it("returns nothing for an empty or stopword-only query", () => {
    expect(retrieve("the and of", { member: member() }).chunks).toHaveLength(0);
    expect(retrieve("", { member: member() }).chunks).toHaveLength(0);
  });

  it("ranks the best chunk first", () => {
    const result = retrieve("nightly compaction writer lock latency", { member: member() });
    expect(result.chunks[0].title).toBe("Platform architecture overview");
    expect(result.chunks[0].score).toBeGreaterThanOrEqual(result.chunks[result.chunks.length - 1].score);
  });

  it("reads what a member actually added", () => {
    store().knowledge.push({
      id: "kb_new",
      workspaceId: "ws_meridian",
      title: "Onboarding checklist",
      kind: "note",
      scope: "general",
      content: "New engineers get repository access on day one and production access after review.",
      sizeBytes: 90,
      updatedAt: Date.now(),
      uploadedBy: "usr_test",
      departmentIds: [],
    });
    const result = retrieve("when do engineers get production access", { member: member() });
    expect(result.sources).toContain("Onboarding checklist");
  });
});
