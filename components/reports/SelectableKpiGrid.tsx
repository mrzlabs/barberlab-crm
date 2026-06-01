"use client";

import { useState } from "react";

type KpiItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
  accentClass: string;
  icon: string;
};

export function SelectableKpiGrid({ kpis }: { kpis: KpiItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {kpis.map((k) => {
        const active = selected === k.id;
        return (
          <article
            key={k.id}
            className={`report-kpi relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-150 ${k.accentClass} ${
              active
                ? "border-cyan-400 ring-2 ring-cyan-400/40 bg-slate-800"
                : "border-white/8 bg-slate-900 hover:bg-slate-800"
            }`}
            onClick={() => setSelected(active ? null : k.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelected(active ? null : k.id)}
          >
            <span className="absolute right-4 top-4 text-2xl opacity-20 select-none">{k.icon}</span>
            {active && (
              <span className="absolute left-2 top-2 rounded-full bg-cyan-400/20 px-2 py-0.5 text-[9px] font-black text-cyan-300 uppercase tracking-wider">
                Seleccionado
              </span>
            )}
            <p className="report-kpi-label mt-1 text-xs font-semibold tracking-widest text-white/70">{k.label}</p>
            <strong className="report-kpi-value mt-2 block truncate text-2xl font-black text-white">{k.value}</strong>
            <p className="report-kpi-detail mt-1 truncate text-xs text-white/60">{k.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
