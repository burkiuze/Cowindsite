import "server-only";
import { cookies } from "next/headers";
import { getMember, getUser, store } from "./store";
import { permissionsFor, type Permission, type Role } from "./rbac";
import type { User, WorkspaceMember, Workspace } from "./types";

/**
 * Session resolution.
 *
 * This build signs a viewer in as a workspace member through a cookie so the
 * whole permission model is exercised end to end. Replacing it with a real
 * identity provider means changing `currentSession` only: every caller already
 * depends on the resolved member, not on how it was resolved.
 */

const COOKIE = "cowind_member";
const DEFAULT_USER_ID = "usr_burak";

export interface Session {
  user: User;
  member: WorkspaceMember;
  workspace: Workspace;
  role: Role;
  permissions: Permission[];
}

export async function currentSession(): Promise<Session> {
  const jar = await cookies();
  const requested = jar.get(COOKIE)?.value;
  const userId = requested && getUser(requested) ? requested : DEFAULT_USER_ID;

  const user = getUser(userId) ?? store().users[0];
  const member = getMember(user.id) ?? store().members[0];

  return {
    user,
    member,
    workspace: store().workspace,
    role: member.role,
    permissions: permissionsFor(member.role),
  };
}

export const SESSION_COOKIE = COOKIE;
