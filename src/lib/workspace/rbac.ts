/**
 * Role-based access control.
 *
 * One rule governs the whole system: **an agent never holds more authority than
 * the person who started the run.** Every agent action is evaluated against the
 * initiating member's permissions, intersected with the agent's own grant — the
 * narrower of the two always wins.
 */

export type Role = "owner" | "admin" | "manager" | "member" | "viewer";

export type Permission =
  | "knowledge:read"
  | "knowledge:write"
  | "agents:run"
  | "agents:create"
  | "agents:manage"
  | "flows:create"
  | "flows:manage"
  | "integrations:use"
  | "integrations:connect"
  | "integrations:manage"
  | "approvals:decide"
  | "finance:read"
  | "members:manage"
  | "audit:read"
  | "workspace:manage";

export const ALL_PERMISSIONS: Permission[] = [
  "knowledge:read",
  "knowledge:write",
  "agents:run",
  "agents:create",
  "agents:manage",
  "flows:create",
  "flows:manage",
  "integrations:use",
  "integrations:connect",
  "integrations:manage",
  "approvals:decide",
  "finance:read",
  "members:manage",
  "audit:read",
  "workspace:manage",
];

const MEMBER_PERMISSIONS: Permission[] = [
  "knowledge:read",
  "knowledge:write",
  "agents:run",
  "flows:create",
  "integrations:use",
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  "agents:create",
  "flows:manage",
  "approvals:decide",
  // The books are scoped like anything else: a workspace member does not see
  // the ledger because they can use the workspace.
  "finance:read",
  "audit:read",
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  "agents:manage",
  "integrations:connect",
  "integrations:manage",
  "members:manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ALL_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  member: MEMBER_PERMISSIONS,
  viewer: ["knowledge:read"],
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
};

export function permissionsFor(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function can(role: Role, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}

/**
 * The authority an agent actually gets for one run: the intersection of what
 * the agent is granted and what the initiating member holds. An agent can be
 * narrower than its initiator, never wider.
 */
export function effectivePermissions(initiatorRole: Role, agentGrants: Permission[]): Permission[] {
  const held = new Set(permissionsFor(initiatorRole));
  return agentGrants.filter((permission) => held.has(permission));
}

export function assertCan(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new AccessError(`Role ${role} lacks ${permission}`);
  }
}

export class AccessError extends Error {
  readonly status = 403;
  constructor(message: string) {
    super(message);
    this.name = "AccessError";
  }
}

export const PERMISSION_LABEL: Record<Permission, string> = {
  "knowledge:read": "Read knowledge",
  "knowledge:write": "Upload knowledge",
  "agents:run": "Run agents",
  "agents:create": "Create agents",
  "agents:manage": "Manage agents",
  "flows:create": "Create flows",
  "flows:manage": "Manage flows",
  "integrations:use": "Use integrations",
  "integrations:connect": "Connect integrations",
  "integrations:manage": "Manage integrations",
  "finance:read": "Read finance",
  "approvals:decide": "Approve actions",
  "members:manage": "Manage people",
  "audit:read": "View audit log",
  "workspace:manage": "Manage workspace",
};
