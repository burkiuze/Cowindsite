import { Icon } from "@/components/ui/Icon";
import { IntegrationGallery } from "@/components/marketing/IntegrationGallery";
import { CATEGORY_LABEL, CATEGORY_ORDER, allServices } from "@/lib/workspace/integrations";

export const metadata = {
  title: "Integrations",
  description:
    "Every service Cowind can reach, with the real state of each connection. Wind reads what it is allowed to read and holds every write for a human decision.",
};

export default function IntegrationsPage() {
  const services = allServices();

  const categories = CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABEL[id] ?? id,
    count: services.filter((service) => service.category === id).length,
  })).filter((entry) => entry.count > 0);

  const ready = services.filter((service) => service.implemented).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="max-w-2xl">
        <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
          {services.length} services, one way of working
        </h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Wind reaches your tools through one path: permission check, then an approval check for anything that writes,
          then execution, then an audit receipt. Reads run without interrupting you. Writes wait for a person.
        </p>
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Fact icon="integrations" value={String(services.length)} label="Services in the catalogue" />
        <Fact icon="check" value={String(ready)} label="With an adapter in this build" />
        <Fact icon="shield" value="Every write" label="Held for a human decision" />
      </div>

      <div className="mt-10">
        <IntegrationGallery services={services} categories={categories} />
      </div>

      <p className="mt-10 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--color-ink-faint)]">
        <Icon name="alert" size={14} className="mt-px shrink-0" />
        A service in this catalogue is one Cowind knows how to represent — not one that is already connected to your
        workspace. Connection state is per workspace, shown honestly inside the product, and never assumed by Wind.
      </p>
    </div>
  );
}

function Fact({ icon, value, label }: { icon: "integrations" | "check" | "shield"; value: string; label: string }) {
  return (
    <div className="panel px-4 py-3.5">
      <Icon name={icon} size={16} className="text-[var(--color-stream-cyan)]" />
      <p className="mt-2.5 text-[20px] leading-none font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
        {value}
      </p>
      <p className="mt-1.5 text-[12px] text-[var(--color-ink-faint)]">{label}</p>
    </div>
  );
}
