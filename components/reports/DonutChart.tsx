"use client";

const RADIUS = 58;
const CX = 80;
const CY = 80;
const STROKE = 22;
const CIRC = 2 * Math.PI * RADIUS;

const PALETTE = [
  "#7c3aed", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#0ea5e9", "#14b8a6",
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
    <article className="report-card overflow-hidden rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="report-truncate text-base font-black text-slate-800">{title}</h3>
      <p className="report-truncate text-xs text-slate-400">{total} en total</p>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* SVG donut */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" width={160} height={160} className="overflow-visible">
            {/* track */}
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none" stroke="#f1f5f9" strokeWidth={STROKE}
            />
            {/* segments */}
            {total === 0 ? (
              <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
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
                }}
              />
            ))}
            {/* center text */}
            <text x={CX} y={CY - 6} textAnchor="middle" className="font-black" style={{ fontSize: 22, fontWeight: 900, fill: "#0f172a" }}>
              {total}
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" style={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {centerLabel ?? "total"}
            </text>
          </svg>
        </div>

        {/* legend */}
        <div className="flex-1 space-y-1.5">
          {total === 0 ? (
            <p className="text-sm text-slate-400">Sin datos en el periodo.</p>
          ) : segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="report-truncate text-xs font-semibold text-slate-700">{seg.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-black text-slate-900">{seg.value}</span>
                <span className="w-9 text-right text-[10px] font-bold text-slate-400">
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

