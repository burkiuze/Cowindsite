import { currentSession } from "@/lib/workspace/session";
import { conversationsFor, createConversation } from "@/lib/workspace/store";
import { handleRouteError, ok, readJson } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await currentSession();
    return ok({ conversations: conversationsFor(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

const createSchema = z.object({ title: z.string().min(1).max(80).optional() });

export async function POST(request: Request) {
  try {
    const session = await currentSession();
    const body = createSchema.parse(await readJson(request, 4_000));
    const conversation = createConversation(session.user.id, body.title ?? "New conversation");
    return ok({ conversation });
  } catch (error) {
    return handleRouteError(error);
  }
}
