"use client";

import { useEffect } from "react";

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
    root.style.setProperty("--brand-primary",   primary);
    root.style.setProperty("--brand-secondary", secondary);
    root.style.setProperty("--brand-accent",    accent);
    root.style.setProperty("--brand-font",      fuente);

    // derive a soft tint (10% opacity) for hover states
    root.style.setProperty("--brand-accent-10", accent + "1a");

    return () => {
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-secondary");
      root.style.removeProperty("--brand-accent");
      root.style.removeProperty("--brand-font");
      root.style.removeProperty("--brand-accent-10");
    };
  }, [primary, secondary, accent, fuente]);

  return null;
}
