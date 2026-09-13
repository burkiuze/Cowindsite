import { z } from "zod";
import { currentSession } from "@/lib/workspace/session";
import { addKnowledge, logActivity } from "@/lib/workspace/store";
import { retrieve, visibleSources } from "@/lib/workspace/knowledge";
import { assertCan } from "@/lib/workspace/rbac";
import { handleRouteError, ok, readJson } from "@/lib/api";
import { LIMITS } from "@/lib/wind/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await currentSession();
    assertCan(session.role, "knowledge:read");
    const query = new URL(request.url).searchParams.get("q");

    if (query) {
      const result = retrieve(query, { member: session.member });
      return ok({ chunks: result.chunks, sources: result.sources });
    }

    const sources = visibleSources({ member: session.member }).map(({ content, ...rest }) => ({
      ...rest,
      preview: content.slice(0, 180),
    }));
    return ok({ sources });
  } catch (error) {
    return handleRouteError(error);
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(160),
  kind: z.enum(["document", "note", "policy", "repository", "dataset", "link"]),
  scope: z.string().min(1).max(40),
  content: z.string().min(1).max(LIMITS.maxPromptChars),
  departmentIds: z.array(z.string().max(64)).max(12).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await currentSession();
    assertCan(session.role, "knowledge:write");
    const body = createSchema.parse(await readJson(request));

    const source = addKnowledge({
      workspaceId: session.workspace.id,
      title: body.title,
      kind: body.kind,
      scope: body.scope,
      content: body.content,
      sizeBytes: body.content.length,
      uploadedBy: session.user.id,
      departmentIds: body.departmentIds ?? [],
    });

    logActivity({
      kind: "knowledge.added",
      actor: session.user.name,
      summary: `Added “${source.title}” to workspace knowledge`,
    });

    return ok({ source: { ...source, content: undefined } });
  } catch (error) {
    return handleRouteError(error);
  }
}
