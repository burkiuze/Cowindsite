import { ServiceLogo } from "@/components/app/ServiceLogo";
import type { CatalogService } from "@/lib/workspace/integrations";

/**
 * The catalogue, moving.
 *
 * Two rows of real brand marks drifting in opposite directions. It exists to
 * make a number — hundreds of services — feel like a fact rather than a claim,
 * so it uses the same assets the gallery does and nothing decorative.
 *
 * The list is duplicated once and translated by exactly half, which is what
 * makes the loop seamless; hovering pauses it, and reduced motion stops it.
 */
export function LogoRiver({ services, reverse = false }: { services: CatalogService[]; reverse?: boolean }) {
  const loop = [...services, ...services];

  return (
    <div className="edge-fade overflow-hidden py-1.5">
      <ul
        className="logo-river flex w-max items-center gap-2.5"
        style={reverse ? { animationDirection: "reverse", animationDuration: "75s" } : undefined}
      >
        {loop.map((service, index) => (
          <li
            key={`${service.slug}-${index}`}
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-panel)]/70 px-3.5 py-2.5"
          >
            <ServiceLogo
              slug={service.slug}
              name={service.name}
              logo={service.logo}
              dark={service.dark}
              size={19}
            />
            <span className="text-[12.5px] whitespace-nowrap text-[var(--color-ink-muted)]">{service.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
