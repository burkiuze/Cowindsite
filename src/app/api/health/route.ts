import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Public health. Deliberately says nothing about who serves Navio's engines —
 * only whether Navio is able to run them.
 */
export async function GET() {
  return ok({
    status: "ok",
    product: "Navio",
    assistant: "Navio",
    windReady: isConfigured(),
    time: new Date().toISOString(),
  });
}
