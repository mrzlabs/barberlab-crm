"use client";

import { useEffect } from "react";

/**
 * Fuentes elegibles por negocio. Todas auto-hospedadas vía next/font
 * en app/layout.tsx — cero requests a Google Fonts en runtime y sin
 * parpadeo de texto (FOUT). Cada nombre mapea a su variable CSS.
 */
export const FONT_VARS: Record<string, string> = {
  Inter: "var(--font-inter)",
  Poppins: "var(--font-poppins)",
  Montserrat: "var(--font-montserrat)",
  Raleway: "var(--font-raleway)",
  "DM Sans": "var(--font-dm-sans)",
  "Playfair Display": "var(--font-playfair)",
  "Space Grotesk": "var(--font-space-grotesk)",
};

export const FONT_OPTIONS = Object.keys(FONT_VARS);

/** Resuelve el nombre guardado en la DB a la variable CSS auto-hospedada. */
export function fontVar(fontFamily?: string | null): string {
  return fontFamily && FONT_VARS[fontFamily] ? FONT_VARS[fontFamily] : FONT_VARS.Inter;
}

export function FontLoader({ fontFamily }: { fontFamily?: string | null }) {
  useEffect(() => {
    document.documentElement.style.setProperty("--brand-font", fontVar(fontFamily));
  }, [fontFamily]);

  return null;
}
