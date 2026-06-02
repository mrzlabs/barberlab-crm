"use client";

const RADIUS = 58;
const CX = 80;
const CY = 80;
const STROKE = 20;
const CIRC = 2 * Math.PI * RADIUS;

const PALETTE = [
  "#00cec9", "#7c3aed", "#06b6d4", "#f59e0b",
  "#10b981", "#8b5cf6", "#0ea5e9", "#ec4899",
];

type Slice = { label: string; value: number };

function buildSegments(slices: Slice[]) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  let cumPct = 0;
  return slices.map((d, i) => {
    const pct = d.value / total;
    const start = cumPct;
    cumPct += pct;
    const startAngle = start * 360 - 90;
    const dash = pct * CIRC;
    return { ...d, pct, dash, startAngle, color: PALETTE[i % PALETTE.length] };
  });
}

export function DonutChart({
  title,
  slices,
  centerLabel,
}: {
  title: string;
  slices: Slice[];
  centerLabel?: string;
}) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  const segments = buildSegments(slices);

  return (
    <article className="report-card glass-panel overflow-hidden rounded-2xl border p-5 shadow-sm">
      <h3 className="report-truncate text-base font-black crm-text-primary">{title}</h3>
      <p className="report-truncate text-xs crm-text-muted">{total} en total</p>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* SVG donut */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" width={148} height={148} className="overflow-visible">
            {/* track */}
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={STROKE}
            />
            {/* segments */}
            {total === 0 ? (
              <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
            ) : segments.map((seg) => (
              <circle
                key={seg.label}
                cx={CX} cy={CY} r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
                strokeLinecap="butt"
                style={{
                  transform: `rotate(${seg.startAngle}deg)`,
                  transformOrigin: `${CX}px ${CY}px`,
                  transition: "stroke-dasharray 0.4s ease",
                  filter: `drop-shadow(0 0 6px ${seg.color}88)`,
                }}
              />
            ))}
            {/* center text */}
            <text x={CX} y={CY - 6} textAnchor="middle" style={{ fontSize: 24, fontWeight: 900, fill: "rgba(255,255,255,0.92)" }}>
              {total}
            </text>
            <text x={CX} y={CY + 13} textAnchor="middle" style={{ fontSize: 9, fill: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {centerLabel ?? "total"}
            </text>
          </svg>
        </div>

        {/* legend */}
        <div className="flex-1 space-y-1">
          {total === 0 ? (
            <p className="text-sm crm-text-muted">Sin datos en el periodo.</p>
          ) : segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/6">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}` }} />
                <span className="report-truncate text-xs font-semibold crm-text-secondary">{seg.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-black crm-text-primary">{seg.value}</span>
                <span className="w-9 text-right text-[10px] font-bold crm-text-muted">
                  {(seg.pct * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
