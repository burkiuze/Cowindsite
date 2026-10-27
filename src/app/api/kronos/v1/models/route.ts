import { modelsView } from "@/lib/kronos/view";

export const dynamic = "force-dynamic";

/** OpenAI-style model list. Public: the models are shown to everyone, and locked without a membership. */
export async function GET() {
  return Response.json({
    object: "list",
    data: modelsView().map((m) => ({ id: m.id, object: "model", owned_by: m.provider, name: m.name, context_length: m.contextWindow })),
  });
}
