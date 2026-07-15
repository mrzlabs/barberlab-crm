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
            className={`relative cursor-pointer overflow-hidden rounded-card border bg-ds-surface p-4 shadow-ds-sm transition-colors ${k.accentClass} ${
              active ? "border-ds-primary ring-2 ring-ds-ring/50" : "border-ds-border hover:border-ds-border-strong"
            }`}
            onClick={() => setSelected(active ? null : k.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelected(active ? null : k.id)}
          >
            {active && (
              <span className="absolute right-2 top-2 rounded-full bg-ds-primary-tint px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ds-primary">
                Seleccionado
              </span>
            )}
            <p className="truncate text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">{k.label}</p>
            <strong className="ds-nums mt-1.5 block truncate text-2xl font-semibold tracking-tight text-ds-fg">{k.value}</strong>
            <p className="mt-1 truncate text-[12px] text-ds-fg-muted">{k.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
