"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import { Pill } from "@/components/ui/primitives";

/** Where the floating navigation ends; the search bar sticks just under it. */
const STICKY_TOP = 62;

export type GalleryService = {
  slug: string;
  name: string;
  category: string;
  logo: string | null;
  description?: string;
  implemented: boolean;
  dark: boolean;
};

/**
 * The full catalogue.
 *
 * Everything is rendered from one client-side list: search is instant, the
 * category filter is a narrowing of the same set, and nothing paginates — a
 * person looking for one service finds it by typing three letters.
 */
export function IntegrationGallery({
  services,
  categories,
}: {
  services: GalleryService[];
  categories: Array<{ id: string; label: string; count: number }>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const deferredQuery = useDeferredValue(query);
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // The search bar sticks under the navigation. Once it has, the whole strip
  // above and beside it is painted solid, so cards scrolling up never show
  // through around the floating nav or between the nav and the filters.
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      rootMargin: `-${STICKY_TOP + 1}px 0px 0px 0px`,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return services.filter((service) => {
      if (category !== "all" && service.category !== category) return false;
      if (!needle) return true;
      return service.name.toLowerCase().includes(needle) || service.slug.includes(needle);
    });
  }, [services, deferredQuery, category]);

  return (
    <div>
      <div ref={sentinel} aria-hidden="true" />
      <div
        className="sticky z-20 -mx-6 bg-[var(--color-void)] px-6 py-4 transition-[border-color]"
        style={{
          top: STICKY_TOP,
          // Inline on purpose: the site's base border colour is unlayered CSS,
          // which outranks a utility class, so a class cannot make this clear.
          borderBottom: `1px solid ${stuck ? "var(--color-hairline)" : "transparent"}`,
          // Full-bleed and upward, clipped at the bar's own bottom edge: a
          // solid backdrop from the top of the window to below the filters.
          ...(stuck
            ? { boxShadow: "0 0 0 100vmax var(--color-void)", clipPath: "inset(-100vmax -100vmax 0 -100vmax)" }
            : null),
        }}
      >
        <div className="panel flex items-center gap-2.5 px-3.5 py-2.5 focus-within:border-[#2b3d4a]">
          <Icon name="search" size={17} className="text-[var(--color-ink-faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${services.length} services…`}
            className="flex-1 bg-transparent text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="focus-ring rounded p-1 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              aria-label="Clear search"
            >
              <Icon name="close" size={14} />
            </button>
          ) : null}
        </div>

        {/* One scrolling row on a phone, so the filters never take half the
            screen once they stick; they wrap on anything wider. */}
        <div className="-mx-6 mt-3 flex gap-1.5 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <CategoryChip active={category === "all"} onClick={() => setCategory("all")} label="All" count={services.length} />
          {categories.map((entry) => (
            <CategoryChip
              key={entry.id}
              active={category === entry.id}
              onClick={() => setCategory(entry.id)}
              label={entry.label}
              count={entry.count}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-[12.5px] text-[var(--color-ink-faint)]">
        {visible.length} {visible.length === 1 ? "service" : "services"}
        {category !== "all" || query ? " matching" : " in the catalogue"}
      </p>

      {visible.length === 0 ? (
        <div className="panel-quiet mt-5 px-6 py-16 text-center">
          <p className="text-[14px] text-[var(--color-ink)]">Nothing matches “{query}”.</p>
          <p className="mt-1.5 text-[13px] text-[var(--color-ink-faint)]">
            If the service has an API, Navio can reach it — tell us what you need connected.
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((service) => (
            <li key={service.slug}>
              <div className="panel flex h-full items-start gap-3 px-3.5 py-3 transition-colors hover:border-[#2b3d4a]">
                <ServiceLogo slug={service.slug} name={service.name} logo={service.logo} dark={service.dark} size={26} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">{service.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
                    {service.description ?? "Available to connect."}
                  </p>
                  {service.implemented ? (
                    <Pill tone="success" className="mt-2">
                      Adapter ready
                    </Pill>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] whitespace-nowrap transition-colors ${
        active
          ? "border-[var(--color-stream-cyan)]/40 bg-[var(--color-stream-cyan)]/10 text-[var(--color-stream-cyan)]"
          : "border-[var(--color-hairline)] text-[var(--color-ink-muted)] hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
      }`}
    >
      {label}
      <span className="ml-1.5 text-[11px] opacity-60">{count}</span>
    </button>
  );
}
