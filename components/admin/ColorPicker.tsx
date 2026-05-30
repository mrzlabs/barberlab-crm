"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Swatch = { color: string; label: string };

export const PRIMARY_SWATCHES: Swatch[] = [
  { color: "#111827", label: "Slate 900 (default)" },
  { color: "#1e1b4b", label: "MRZLABS Indigo" },
  { color: "#0f172a", label: "Slate 950" },
  { color: "#1a0536", label: "MRZLABS Noche" },
  { color: "#064e3b", label: "Esmeralda 900" },
  { color: "#1e3a5f", label: "Navy Oscuro" },
  { color: "#3b0764", label: "Púrpura 950" },
  { color: "#1c1917", label: "Stone 900" },
  { color: "#7f1d1d", label: "Rojo Barbería" },
  { color: "#431407", label: "Cobre Oscuro" },
  { color: "#030712", label: "Gris Carbón" },
  { color: "#ffffff", label: "Blanco (claro)" },
];

export const SECONDARY_SWATCHES: Swatch[] = [
  { color: "#22d3ee", label: "Cyan 400 (default)" },
  { color: "#06b6d4", label: "Cyan 500" },
  { color: "#67e8f9", label: "Cyan 300" },
  { color: "#38bdf8", label: "Sky 400" },
  { color: "#34d399", label: "Esmeralda 400" },
  { color: "#4ade80", label: "Verde 400" },
  { color: "#a78bfa", label: "Violeta 400" },
  { color: "#f472b6", label: "Rosa 400" },
  { color: "#fb923c", label: "Naranja 400" },
  { color: "#fbbf24", label: "Ámbar 400" },
  { color: "#818cf8", label: "Índigo 400" },
  { color: "#86efac", label: "Verde 300" },
];

export const ACCENT_SWATCHES: Swatch[] = [
  { color: "#7c3aed", label: "Violeta MRZLABS" },
  { color: "#6d28d9", label: "Violeta 700" },
  { color: "#8b5cf6", label: "Violeta 500" },
  { color: "#4f46e5", label: "Índigo 600" },
  { color: "#0ea5e9", label: "Sky 500" },
  { color: "#06b6d4", label: "Cyan 500" },
  { color: "#10b981", label: "Esmeralda 500" },
  { color: "#f59e0b", label: "Ámbar 500" },
  { color: "#ef4444", label: "Rojo 500" },
  { color: "#ec4899", label: "Rosa 500" },
  { color: "#84cc16", label: "Lima 500" },
  { color: "#f97316", label: "Naranja 500" },
];

function isLight(hex: string): boolean {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export function ColorPicker({
  name,
  defaultValue,
  swatches,
  label,
}: {
  name: string;
  defaultValue: string;
  swatches: Swatch[];
  label: string;
}) {
  const [selected, setSelected] = useState(defaultValue || "#111827");

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{label}</span>
        <span className="flex items-center gap-2">
          <span
            className="size-6 rounded-lg border border-slate-200 shadow-inner"
            style={{ backgroundColor: selected }}
          />
          <code className="text-xs font-mono text-slate-400">{selected}</code>
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {swatches.map((s) => (
          <button
            key={s.color}
            type="button"
            title={s.label}
            onClick={() => setSelected(s.color)}
            className="relative size-10 rounded-xl border-2 transition-all duration-150 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: s.color,
              borderColor: selected === s.color ? "#7c3aed" : "rgba(0,0,0,0.08)",
              boxShadow:
                selected === s.color
                  ? "0 0 0 3px rgba(124,58,237,0.22), 0 2px 8px rgba(0,0,0,0.15)"
                  : "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            {selected === s.color && (
              <Check
                className="absolute inset-0 m-auto size-4"
                style={{ color: isLight(s.color) ? "#111827" : "#ffffff" }}
              />
            )}
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-violet-300 hover:bg-white">
        <span>Personalizado</span>
        <input
          type="color"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0 outline-none"
        />
        <span className="ml-auto font-mono text-xs text-slate-400">{selected}</span>
      </label>

      <input type="hidden" name={name} value={selected} />
    </div>
  );
}
