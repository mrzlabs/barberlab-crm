"use client";

import { useId } from "react";

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
  const id = useId();

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

      <svg className="absolute inset-0 h-full w-full opacity-75" viewBox="0 0 1440 920" preserveAspectRatio="none">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {[
            "M72 210 C210 118 342 302 488 220 S760 118 914 238 1172 336 1348 202",
            "M116 638 C292 496 418 724 612 566 S894 454 1038 604 1244 774 1396 620",
            "M220 384 C382 312 514 438 662 346 S952 210 1134 392 1306 492 1428 430",
            "M14 794 C188 692 352 854 526 744 S828 648 1004 770 1236 900 1440 790",
            "M0 82 C168 32 320 136 470 98 S774 18 910 118 1192 184 1440 76",
          ].map((d, i) => (
            <path
              d={d}
              key={d}
              stroke={i % 2 === 0 ? "rgba(var(--brand-secondary-rgb,34,211,238),0.28)" : "rgba(var(--brand-accent-rgb,124,58,237),0.24)"}
              strokeWidth={i % 2 === 0 ? "1.35" : "1"}
              strokeDasharray="4 18"
            >
              <animate attributeName="stroke-dashoffset" dur={`${16 + i * 3}s`} from="0" repeatCount="indefinite" to="-220" />
            </path>
          ))}
        </g>
        <g>
          {[
            [128, 194], [306, 286], [492, 218], [776, 154], [930, 240], [1190, 340], [1350, 204],
            [164, 620], [422, 700], [618, 566], [908, 464], [1042, 604], [1238, 770],
            [220, 384], [524, 436], [664, 346], [958, 214], [1136, 394], [1306, 492],
            [190, 62], [468, 98], [772, 36], [912, 118], [1224, 178],
          ].map(([cx, cy], i) => (
            <circle
              cx={cx}
              cy={cy}
              fill={i % 3 === 0 ? "rgba(var(--brand-secondary-rgb,34,211,238),0.9)" : "rgba(var(--brand-accent-rgb,124,58,237),0.78)"}
              key={`${cx}-${cy}`}
              r={i % 4 === 0 ? 2.2 : 1.45}
            >
              <animate attributeName="opacity" dur={`${3.2 + (i % 5)}s`} repeatCount="indefinite" values="0.2;1;0.35;0.75;0.2" />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
}
