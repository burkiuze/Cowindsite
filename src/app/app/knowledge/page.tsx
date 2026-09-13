import { currentSession } from "@/lib/workspace/session";
import { store, userName } from "@/lib/workspace/store";
import { visibleSources } from "@/lib/workspace/knowledge";
import { can } from "@/lib/workspace/rbac";
import { PageHeader, Panel, Pill, relativeTime } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/Icon";
import { KnowledgeSearch } from "./KnowledgeSearch";

export const dynamic = "force-dynamic";
export const metadata = { title: "Knowledge" };

const KIND_ICON: Record<string, IconName> = {
  document: "knowledge",
  note: "knowledge",
  policy: "shield",
  repository: "integrations",
  dataset: "analytics",
  link: "external",
};

export default async function KnowledgePage() {
  const session = await currentSession();
  const state = store();
  const sources = visibleSources({ member: session.member });
  const hidden = state.knowledge.length - sources.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <PageHeader
        title="Knowledge"
        description="What the workspace knows. Scopes decide who — and which agent — can read a source; nothing is visible to everything by default."
      />

      <div className="mt-6">
        <KnowledgeSearch canWrite={can(session.role, "knowledge:write")} />
      </div>

      {hidden > 0 ? (
        <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-faint)]">
          <Icon name="lock" size={13} />
          {hidden} source{hidden === 1 ? " is" : "s are"} scoped to departments you are not in.
        </p>
      ) : null}

      <ul className="mt-5 space-y-2.5">
        {sources.map((source) => (
          <li key={source.id}>
            <Panel className="px-5 py-4">
              <div className="flex items-start gap-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[var(--color-ink-muted)]">
                  <Icon name={KIND_ICON[source.kind] ?? "knowledge"} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-medium text-[var(--color-ink)]">{source.title}</h3>
                    <Pill tone="info">{source.scope}</Pill>
                    {source.departmentIds.length === 0 ? <Pill>workspace-wide</Pill> : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                    {source.content.slice(0, 220)}
                  </p>
                  <p className="mt-2 text-[11.5px] text-[var(--color-ink-faint)]">
                    {source.kind} · {(source.sizeBytes / 1024).toFixed(1)} KB · added by {userName(source.uploadedBy)} ·
                    updated {relativeTime(source.updatedAt)}
                  </p>
                </div>
              </div>
            </Panel>
          </li>
        ))}
      </ul>
    </div>
  );
}
