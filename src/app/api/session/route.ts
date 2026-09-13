import { z } from "zod";
import { NextResponse } from "next/server";
import { currentSession, SESSION_COOKIE } from "@/lib/workspace/session";
import { getUser } from "@/lib/workspace/store";
import { PERMISSION_LABEL, ROLE_LABEL } from "@/lib/workspace/rbac";
import { fail, handleRouteError, ok, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await currentSession();
    return ok({
      user: session.user,
      role: session.role,
      roleLabel: ROLE_LABEL[session.role],
      workspace: session.workspace,
      permissions: session.permissions.map((permission) => ({
        id: permission,
        label: PERMISSION_LABEL[permission],
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

const switchSchema = z.object({ userId: z.string().max(64) });

/** Switch the acting member. Exercises the permission model end to end. */
export async function POST(request: Request) {
  try {
    const body = switchSchema.parse(await readJson(request, 4_000));
    if (!getUser(body.userId)) return fail(404, "That member is not in this workspace.");

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, body.userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
