"use client";

let idCounter = 0;

export function AnimatedGrid({
  className = "",
  lineOpacity = 0.12,
  accentOpacity = 0.22,
  dark = false,
}: {
  className?: string;
  lineOpacity?: number;
  accentOpacity?: number;
  dark?: boolean;
}) {
  // stable id per component instance (SSR-safe via module counter)
  const id = `agrid-${++idCounter}`;

  const lineColor = dark
    ? `rgba(255,255,255,${lineOpacity})`
    : `rgba(var(--brand-primary-rgb,17,24,39),${lineOpacity})`;
  const largeLine = dark
    ? `rgba(255,255,255,${lineOpacity * 0.45})`
    : `rgba(var(--brand-primary-rgb,17,24,39),${lineOpacity * 0.45})`;

  const secondaryGlow = dark
    ? `rgba(34,211,238,${accentOpacity})`
    : `rgba(var(--brand-secondary-rgb,34,211,238),${accentOpacity})`;
  const accentGlow = dark
    ? `rgba(124,58,237,${accentOpacity})`
    : `rgba(var(--brand-accent-rgb,124,58,237),${accentOpacity})`;

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {/* SVG grid lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`${id}-sm`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={lineColor} strokeWidth="0.5" />
          </pattern>
          <pattern id={`${id}-lg`} width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke={largeLine} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-sm)`} />
        <rect width="100%" height="100%" fill={`url(#${id}-lg)`} />
      </svg>

      {/* corner radial glows */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 50% 38% at 6% 4%, ${secondaryGlow}, transparent 65%)`,
            `radial-gradient(ellipse 44% 34% at 94% 96%, ${accentGlow}, transparent 65%)`,
          ].join(", "),
        }}
      />
    </div>
  );
}
