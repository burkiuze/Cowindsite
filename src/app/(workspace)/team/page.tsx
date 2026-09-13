import { currentSession } from "@/lib/workspace/session";
import { store } from "@/lib/workspace/store";
import { PERMISSION_LABEL, ROLE_LABEL, ROLE_PERMISSIONS, type Role } from "@/lib/workspace/rbac";
import { PageHeader, Panel, Pill, SectionHeader, relativeTime } from "@/components/ui/primitives";
import { MemberSwitcher } from "./MemberSwitcher";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team" };

const ROLES: Role[] = ["owner", "admin", "manager", "member", "viewer"];

export default async function TeamPage() {
  const session = await currentSession();
  const state = store();

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <PageHeader
        title="Team"
        description="People, their role, and the departments whose knowledge they can reach. Roles are what bound every agent run started by that person."
      />

      <Panel className="mt-7" padded={false}>
        <div className="px-5 py-4">
          <SectionHeader title="People" hint={`${state.members.length} in ${state.workspace.name}`} />
        </div>
        <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
          {state.members.map((member) => {
            const user = state.users.find((candidate) => candidate.id === member.userId);
            if (!user) return null;
            const departments = member.departmentIds
              .map((id) => state.workspace.departments.find((department) => department.id === id)?.name)
              .filter(Boolean);

            return (
              <li key={member.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[11.5px] font-semibold text-[var(--color-ink)]">
                  {user.avatarInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-ink)]">
                    {user.name}
                    {user.id === session.user.id ? <Pill tone="info">you</Pill> : null}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--color-ink-faint)]">
                    {user.title ?? user.email} · joined {relativeTime(member.joinedAt)}
                  </p>
                </div>
                <span className="text-[12px] text-[var(--color-ink-muted)]">{departments.join(", ") || "—"}</span>
                <Pill tone={member.status === "active" ? "neutral" : "warning"}>{ROLE_LABEL[member.role]}</Pill>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel>
          <SectionHeader title="Roles" hint="What each role may do" />
          <div className="mt-4 space-y-3.5">
            {ROLES.map((role) => (
              <div key={role}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[var(--color-ink)]">{ROLE_LABEL[role]}</span>
                  <span className="text-[11.5px] text-[var(--color-ink-faint)]">
                    {ROLE_PERMISSIONS[role].length} permissions
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[role].slice(0, 6).map((permission) => (
                    <span
                      key={permission}
                      className="rounded-md border border-[var(--color-hairline)] px-1.5 py-0.5 text-[11px] text-[var(--color-ink-faint)]"
                    >
                      {PERMISSION_LABEL[permission]}
                    </span>
                  ))}
                  {ROLE_PERMISSIONS[role].length > 6 ? (
                    <span className="px-1 py-0.5 text-[11px] text-[var(--color-ink-faint)]">
                      +{ROLE_PERMISSIONS[role].length - 6} more
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            title="Act as"
            hint="Switch the acting member to see the permission model working end to end"
          />
          <div className="mt-4">
            <MemberSwitcher
              members={state.members.map((member) => {
                const user = state.users.find((candidate) => candidate.id === member.userId)!;
                return { userId: user.id, name: user.name, role: ROLE_LABEL[member.role] };
              })}
              activeUserId={session.user.id}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
