import { NextResponse, type NextRequest } from "next/server";

/**
 * Public site only.
 *
 * The workspace is built and tested, but it is not open: /app and the routes
 * that drive it are sealed off unless an operator deliberately opens them.
 * Two ways in, both server-side:
 *
 *   NAVIO_WORKSPACE_ENABLED=1   opens the workspace to everyone
 *
 * The pre-rename names (COWIND_*) are still accepted, so a deployment that
 * already holds them keeps working through the rename.
 *   NAVIO_PREVIEW_KEY=<secret>  opens it to whoever visits /app?preview=<secret>,
 *                                which sets an http-only cookie for later visits
 *
 * With neither set — the default — a page request is redirected to the public
 * site and an API request gets a flat 404. Nothing hints that there is a
 * workspace behind the door.
 */

const PREVIEW_COOKIE = "navio_preview";

/** API routes that belong to the workspace. `/api/health` stays public. */
const SEALED_API = [
  "/api/wind",
  "/api/conversations",
  "/api/approvals",
  "/api/tasks",
  "/api/knowledge",
  "/api/integrations",
  "/api/activity",
  "/api/session",
];

function clean(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isWorkspacePage = pathname === "/app" || pathname.startsWith("/app/");
  const isWorkspaceApi = SEALED_API.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isWorkspacePage && !isWorkspaceApi) return NextResponse.next();

  if (clean(process.env.NAVIO_WORKSPACE_ENABLED ?? process.env.COWIND_WORKSPACE_ENABLED) === "1") {
    return NextResponse.next();
  }

  const key = clean(process.env.NAVIO_PREVIEW_KEY ?? process.env.COWIND_PREVIEW_KEY);
  if (key) {
    if (request.cookies.get(PREVIEW_COOKIE)?.value === key) return NextResponse.next();

    // A correct key in the URL unlocks this browser and drops the query string,
    // so the secret does not stay in the address bar or in a shared link.
    if (searchParams.get("preview") === key) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("preview");
      const response = NextResponse.redirect(url);
      response.cookies.set(PREVIEW_COOKIE, key, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
  }

  if (isWorkspaceApi) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const home = request.nextUrl.clone();
  home.pathname = "/access";
  home.search = "";
  return NextResponse.redirect(home);
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
