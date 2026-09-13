import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Public health. Deliberately says nothing about who serves Wind's engines —
 * only whether Cowind is able to run them.
 */
export async function GET() {
  return ok({
    status: "ok",
    product: "Cowind",
    assistant: "Wind",
    windReady: isConfigured(),
    time: new Date().toISOString(),
  });
}
