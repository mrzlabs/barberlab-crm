import type { Metadata } from "next";
import {
  DM_Sans,
  Inter,
  Montserrat,
  Outfit,
  Playfair_Display,
  Poppins,
  Raleway,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

// Fuente base del CRM (precargada)
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

// Fuentes elegibles por negocio (auto-hospedadas, sin llamadas a Google Fonts
// en runtime; preload: false — solo se descargan si el negocio las usa)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-poppins", display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap", preload: false });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", preload: false });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap", preload: false });

const fontVariables = [
  outfit.variable,
  inter.variable,
  poppins.variable,
  montserrat.variable,
  raleway.variable,
  dmSans.variable,
  playfair.variable,
  spaceGrotesk.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Operux CRM",
  description: "CRM operativo para barberias, peluquerias, spa de uñas y tatuajes.",
};

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL — check Vercel environment variables");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY — check Vercel environment variables");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVariables}>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
