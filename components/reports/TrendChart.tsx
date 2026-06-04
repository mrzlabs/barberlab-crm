"use client";

import { useState } from "react";
import type { TrendPoint } from "@/lib/admin/reports";

const CHART_H = 180;
const CHART_W = 800;
const PAD = { top: 20, right: 20, bottom: 40, left: 62 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

function shortDate(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

function shortMoney(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(v);
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Sin datos para el período seleccionado.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.ingresos), 1);
  const barW = Math.max(4, Math.min(28, (INNER_W / data.length) * 0.65));
  const step = INNER_W / data.length;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.ceil(data.length / 16);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        className="w-full"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ minWidth: `${Math.max(420, data.length * 18)}px` }}
      >
        {/* Y grid + labels */}
        {yTicks.map((t) => {
          const y = PAD.top + INNER_H * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} stroke="var(--report-grid,#334155)" strokeWidth={t === 0 ? 1.5 : 1} strokeDasharray={t === 0 ? undefined : "4 3"} />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--report-axis,#cbd5e1)" fontWeight="700">{shortMoney(maxVal * t)}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max(2, (d.ingresos / maxVal) * INNER_H);
          const cx = PAD.left + step * i + step / 2;
          const x = cx - barW / 2;
          const y = PAD.top + INNER_H - barH;
          const isHover = hover === i;

          // Tooltip clamp to chart bounds
          const ttX = Math.min(Math.max(cx - 56, PAD.left), CHART_W - PAD.right - 112);
          const ttY = Math.max(y - 46, PAD.top);

          return (
            <g key={d.fecha}>
              {/* bar */}
              <rect
                x={x} y={y} width={barW} height={barH} rx="3"
                fill={isHover ? "var(--brand-accent,#7c3aed)" : "var(--report-bar,#00cec9)"}
                opacity={isHover ? 1 : 0.8}
                style={{ transition: "fill .12s,opacity .12s" }}
              />
              {/* invisible hit zone */}
              <rect
                x={PAD.left + step * i} y={PAD.top}
                width={step} height={INNER_H + 8}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "crosshair" }}
              />
              {/* x label */}
              {i % labelEvery === 0 && (
                <text x={cx} y={CHART_H - 10} textAnchor="middle" fontSize="9" fill="var(--report-axis,#cbd5e1)" fontWeight="700">
                  {shortDate(d.fecha)}
                </text>
              )}
              {/* tooltip */}
              {isHover && (
                <g>
                  <rect x={ttX} y={ttY} width={112} height={38} rx="7" fill="var(--report-tooltip-bg,#1e293b)" stroke="var(--report-tooltip-border,rgba(255,255,255,.14))" opacity="0.97" />
                  <text x={ttX + 8} y={ttY + 14} fontSize="10" fill="var(--brand-secondary,#67e8f9)" fontWeight="800">{d.fecha}</text>
                  <text x={ttX + 8} y={ttY + 29} fontSize="10" fill="var(--report-tooltip-text,#ffffff)" fontWeight="600">
                    {shortMoney(d.ingresos)} · {d.turnos} turnos
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

