"use client";

import { useEffect } from "react";

const FONTS: Record<string, string> = {
  Inter: "Inter:wght@400;500;600;700;800;900",
  Poppins: "Poppins:wght@400;500;600;700;800;900",
  Montserrat: "Montserrat:wght@400;500;600;700;800;900",
  Raleway: "Raleway:wght@400;500;600;700;800;900",
  "DM Sans": "DM+Sans:wght@400;500;600;700;800;900",
  "Playfair Display": "Playfair+Display:wght@400;500;600;700;800;900",
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
};

export const FONT_OPTIONS = Object.keys(FONTS);

export function FontLoader({ fontFamily }: { fontFamily?: string | null }) {
  useEffect(() => {
    const font = fontFamily && FONTS[fontFamily] ? fontFamily : "Inter";
    const id = "barberlab-business-font";
    const href = `https://fonts.googleapis.com/css2?family=${FONTS[font]}&display=swap`;
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
    document.documentElement.style.setProperty("--brand-font", font);
  }, [fontFamily]);

  return null;
}
