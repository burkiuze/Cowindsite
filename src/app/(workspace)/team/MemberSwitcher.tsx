"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

/**
 * Switch the acting member.
 *
 * Not a login screen: a way to see Cowind through another role's permissions,
 * which is the fastest way to check that scoping actually holds.
 */
export function MemberSwitcher({
  members,
  activeUserId,
}: {
  members: Array<{ userId: string; name: string; role: string }>;
  activeUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function switchTo(userId: string) {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <ul className="space-y-1.5">
      {members.map((member) => {
        const active = member.userId === activeUserId;
        return (
          <li key={member.userId}>
            <button
              type="button"
              disabled={pending || active}
              onClick={() => void switchTo(member.userId)}
              className={`focus-ring flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors ${
                active
                  ? "border-[#2b3d4a] bg-[var(--color-raised)] text-[var(--color-ink)]"
                  : "border-[var(--color-hairline)] text-[var(--color-ink-muted)] hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
              }`}
            >
              <span className="flex-1">{member.name}</span>
              <span className="text-[11.5px] text-[var(--color-ink-faint)]">{member.role}</span>
              {active ? <Icon name="check" size={14} className="text-[var(--color-stream-cyan)]" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
