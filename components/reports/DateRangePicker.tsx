"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  from: string;
  to: string;
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function getPresets() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const weekStart = new Date(now);
  weekStart.setDate(d - now.getDay());

  const lastMonthStart = new Date(y, m - 1, 1);
  const lastMonthEnd   = new Date(y, m, 0);

  return [
    { label: "Hoy",            from: fmt(now), to: fmt(now) },
    { label: "Esta semana",    from: fmt(weekStart), to: fmt(now) },
    { label: "Este mes",       from: fmt(new Date(y, m, 1)), to: fmt(now) },
    { label: "Mes anterior",   from: fmt(lastMonthStart), to: fmt(lastMonthEnd) },
    { label: "Últimos 3 meses",from: fmt(new Date(y, m - 2, 1)), to: fmt(now) },
    { label: "Este año",       from: fmt(new Date(y, 0, 1)), to: fmt(now) },
  ] as const;
}

const inputCls =
  "w-full rounded-xl border border-ds-border bg-ds-surface px-3 py-2 text-sm text-ds-fg placeholder:text-ds-fg-subtle outline-none focus:border-ds-primary";

export function DateRangePicker({ from, to }: Props) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo,   setCustomTo]   = useState(to);
  const presets = getPresets();

  useEffect(() => {
    setCustomFrom(from);
    setCustomTo(to);
  }, [from, to]);

  function navigate(f: string, t: string) {
    router.push(`/admin/reportes?from=${f}&to=${t}`);
  }

  // Preset is active only when URL params AND custom inputs match
  const customChanged = customFrom !== from || customTo !== to;
  const activePreset = customChanged ? undefined : presets.find((p) => p.from === from && p.to === to);

  return (
    <div className="mt-5 space-y-3 no-print">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = preset.label === activePreset?.label;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => navigate(preset.from, preset.to)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                active
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-ds-border bg-ds-surface text-ds-fg-muted hover:border-ds-border-strong hover:bg-ds-surface-2 hover:text-ds-fg"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom range */}
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(customFrom, customTo);
        }}
      >
        <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ds-fg-muted">
          Desde
          <input
            className={inputCls}
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ds-fg-muted">
          Hasta
          <input
            className={inputCls}
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </label>
        <button
          className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-300 transition"
          type="submit"
        >
          Aplicar
        </button>
      </form>
    </div>
  );
}
