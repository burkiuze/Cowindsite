type Props = {
  slug: string;
  name: string;
  logo: string | null;
  size?: number;
  className?: string;
  /** Set for marks drawn in dark ink, which would vanish on a near-black panel. */
  dark?: boolean;
};

/**
 * A service's own brand mark.
 *
 * Real logos, served locally from `public/logos` rather than hotlinked, so the
 * gallery renders the same offline, on a preview deployment, and behind a
 * strict content policy. Services whose mark is missing fall back to a lettered
 * tile instead of a wrong logo.
 *
 * Marks measured as dark ink at build time get a light plate to sit on — the
 * alternative is a black logo on a black panel. Everything colourful is left
 * exactly as the brand drew it.
 */
export function ServiceLogo({ slug, name, logo, size = 22, className = "", dark = false }: Props) {
  if (!logo) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-md border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[11px] font-semibold text-[var(--color-ink-muted)] ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  const mark = (
    /* eslint-disable-next-line @next/next/no-img-element --
       700+ tiny fixed-size marks, already optimised to 96px WebP at build time:
       routing each through the image optimizer adds a request per logo and a
       per-image cost for no visual gain at 22px. */
    <img
      src={logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      data-service={slug}
      className={`shrink-0 rounded-[4px] object-contain ${dark ? "" : className}`}
      style={{ width: dark ? size * 0.78 : size, height: dark ? size * 0.78 : size }}
    />
  );

  if (!dark) return mark;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[5px] bg-[#e8ebf0] ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="flex items-center justify-center" style={{ width: size * 0.78, height: size * 0.78 }}>
        {mark}
      </span>
    </span>
  );
}
