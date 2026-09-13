/**
 * Ambient background: a few slow current lines.
 *
 * The motif is movement through a system — lines that enter, bend and leave —
 * rendered at very low contrast so it reads as texture, never as decoration
 * competing with content. It sits behind everything and is inert to pointers.
 */
export function StreamField({ intensity = 1 }: { intensity?: number }) {
  const lines = [
    { d: "M-40 120C180 40 420 200 700 110S1180 20 1480 140", opacity: 0.3 },
    { d: "M-40 260C220 180 430 330 760 240S1200 170 1480 300", opacity: 0.22 },
    { d: "M-40 420C160 350 470 470 780 390S1210 330 1480 450", opacity: 0.16 },
    { d: "M-40 580C200 520 450 640 800 560S1220 500 1480 610", opacity: 0.12 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="sf-cool" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#18D8FF" stopOpacity="0" />
            <stop offset="0.3" stopColor="#18D8FF" />
            <stop offset="0.62" stopColor="#B06BE0" />
            <stop offset="1" stopColor="#F0567F" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sf-warm" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6FDC8C" stopOpacity="0" />
            <stop offset="0.35" stopColor="#FFD830" />
            <stop offset="0.7" stopColor="#FF8A3C" />
            <stop offset="1" stopColor="#F0567F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((line, index) => (
          <path
            key={line.d}
            d={line.d}
            stroke={index % 2 === 0 ? "url(#sf-cool)" : "url(#sf-warm)"}
            strokeWidth={index === 0 ? 1.5 : 1}
            opacity={line.opacity * intensity}
            className="stream-line"
            style={{ animationDelay: `${index * -2.2}s`, animationDuration: `${11 + index * 2}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
