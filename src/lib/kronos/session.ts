import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db, type Account } from "./db";
import { sha256Hex } from "./crypto";

export function clerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

/** The signed-in person on the website, with their Kronos account (created on first visit). */
export async function siteAccount(): Promise<{ userId: string; email: string | null; account: Account } | null> {
  if (!clerkConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
  const account = await db.upsertAccount(userId, email);
  return { userId, email, account };
}

/** The account behind an app's `Authorization: Bearer kro_…` header. */
export async function bearerAccount(request: Request): Promise<Account | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = /^Bearer\s+(kro_[A-Za-z0-9_-]{20,})$/.exec(header.trim())?.[1];
  if (!token) return null;
  return db.auth(sha256Hex(token));
}
