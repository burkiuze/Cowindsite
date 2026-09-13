"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NavioMark } from "@/components/brand/NavioMark";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Conversation } from "@/lib/workspace/types";

type NavItem = { href: string; label: string; icon: IconName; badge?: number };

export type SidebarProps = {
  workspaceName: string;
  workspacePlan: string;
  userName: string;
  userInitials: string;
  userTitle: string;
  roleLabel: string;
  pendingApprovals: number;
  runningTasks: number;
  conversations: Conversation[];
};

/**
 * Workspace navigation.
 *
 * Ordered by how the product is actually used: what is happening now (Home,
 * Navio), what is in flight (Tasks, Flows, Approvals), and what the workspace is
 * made of (Agents, Knowledge, Integrations, Team, Analytics). Counts appear
 * only where a number means someone is waiting.
 */
export function Sidebar(props: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const work: NavItem[] = [
    { href: "/app/home", label: "Home", icon: "home" },
    { href: "/app/wind", label: "Navio", icon: "wind" },
    { href: "/app/tasks", label: "Tasks", icon: "tasks", badge: props.runningTasks || undefined },
    { href: "/app/flows", label: "Flows", icon: "flows" },
    { href: "/app/approvals", label: "Approvals", icon: "approvals", badge: props.pendingApprovals || undefined },
  ];

  const workspace: NavItem[] = [
    { href: "/app/agents", label: "Agents", icon: "agents" },
    { href: "/app/knowledge", label: "Knowledge", icon: "knowledge" },
    { href: "/app/integrations", label: "Integrations", icon: "integrations" },
    { href: "/app/team", label: "Team", icon: "team" },
    { href: "/app/analytics", label: "Analytics", icon: "analytics" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="relative z-20 flex h-dvh shrink-0 flex-col border-r border-[var(--color-hairline)] bg-[var(--color-surface)]/55 backdrop-blur-xl transition-[width] duration-200"
      style={{ width: collapsed ? 68 : "var(--shell-sidebar)" }}
    >
      {/* The company, first. Its own mark, its own name, and a switcher — the
          product's name lives in the page, not stacked above the company's. */}
      <div className="flex h-[60px] items-center gap-2 px-3.5">
        <Link href="/app/home" className="focus-ring flex min-w-0 items-center gap-2.5 rounded-lg">
          <NavioMark size={26} state="flow" priority />
          {!collapsed ? (
            <>
              <span className="truncate text-[14.5px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                {props.workspaceName}
              </span>
              <Icon name="chevron-down" size={13} className="shrink-0 text-[var(--color-ink-faint)]" />
            </>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="focus-ring ml-auto rounded-md p-1.5 text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]"
            aria-label="Collapse navigation"
          >
            <Icon name="chevron-left" size={16} />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="focus-ring mx-auto mt-3 rounded-md p-1.5 text-[var(--color-ink-faint)] hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]"
          aria-label="Expand navigation"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      ) : (
        <div className="h-1" />
      )}

      {/* Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
        <NavGroup items={work} collapsed={collapsed} isActive={isActive} />

        <div className="mt-5">
          {!collapsed ? <GroupLabel>Workspace</GroupLabel> : <Divider />}
          <NavGroup items={workspace} collapsed={collapsed} isActive={isActive} />
        </div>

        {!collapsed ? (
          <div className="mt-6">
            <div className="flex items-center justify-between px-2.5">
              <GroupLabel>Chats</GroupLabel>
              <Link
                href="/app/wind"
                className="focus-ring rounded-md p-1 text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]"
                aria-label="New chat"
              >
                <Icon name="plus" size={15} />
              </Link>
            </div>

            <Link
              href="/app/wind"
              className="focus-ring mt-1.5 flex items-center gap-2 rounded-lg border border-dashed border-[#242a33] px-2.5 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-stream-cyan)]/40 hover:text-[var(--color-ink)]"
            >
              <Icon name="plus" size={14} />
              New chat
            </Link>

            <ul className="mt-1.5 space-y-0.5">
              {props.conversations.slice(0, 12).map((conversation) => {
                const href = `/app/wind/${conversation.id}`;
                return (
                  <li key={conversation.id}>
                    <Link
                      href={href}
                      className={`focus-ring flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors ${
                        isActive(href)
                          ? "bg-[var(--color-raised)] text-[var(--color-ink)]"
                          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <span className="truncate">{conversation.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </nav>

      {/* Member */}
      <div className="border-t border-[var(--color-hairline)] p-3">
        <button
          type="button"
          onClick={() => router.push("/app/settings")}
          className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--color-panel)]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[11px] font-semibold text-[var(--color-ink)]">
            {props.userInitials}
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-[var(--color-ink)]">
                  {props.userName}
                </span>
                <span className="block truncate text-[11px] text-[var(--color-ink-faint)]">{props.roleLabel}</span>
              </span>
              <Icon name="settings" size={15} className="text-[var(--color-ink-faint)]" />
            </>
          ) : null}
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  items,
  collapsed,
  isActive,
}: {
  items: NavItem[];
  collapsed: boolean;
  isActive: (href: string) => boolean;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`focus-ring group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13.5px] transition-colors ${
                active
                  ? "bg-[var(--color-raised)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {active ? (
                <span className="absolute top-1/2 left-0 h-4 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)]" />
              ) : null}
              <Icon
                name={item.icon}
                size={17}
                className={active ? "text-[var(--color-stream-cyan)]" : "text-current"}
              />
              {!collapsed ? (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-[var(--color-stream-amber)]/15 px-1.5 py-[1px] text-[11px] font-semibold text-[var(--color-stream-amber)]">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 pb-1.5 text-[10.5px] font-semibold tracking-[0.12em] text-[var(--color-ink-faint)] uppercase">
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-auto my-3 h-px w-7 bg-[var(--color-hairline)]" />;
}
