"use client";

import { useEffect } from "react";

function hexToRgbCsv(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "17,24,39";
  return `${r},${g},${b}`;
}

export function ThemeApplier({
  primary,
  secondary,
  accent,
  fuente,
}: {
  primary: string;
  secondary: string;
  accent: string;
  fuente: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary",       primary);
    root.style.setProperty("--brand-secondary",     secondary);
    root.style.setProperty("--brand-accent",        accent);
    root.style.setProperty("--brand-font",          fuente);
    root.style.setProperty("--brand-accent-10",     accent + "1a");
    root.style.setProperty("--brand-primary-rgb",   hexToRgbCsv(primary));
    root.style.setProperty("--brand-secondary-rgb", hexToRgbCsv(secondary));
    root.style.setProperty("--brand-accent-rgb",    hexToRgbCsv(accent));

    return () => {
      [
        "--brand-primary", "--brand-secondary", "--brand-accent",
        "--brand-font", "--brand-accent-10",
        "--brand-primary-rgb", "--brand-secondary-rgb", "--brand-accent-rgb",
      ].forEach(v => root.style.removeProperty(v));
    };
  }, [primary, secondary, accent, fuente]);

  return null;
}
