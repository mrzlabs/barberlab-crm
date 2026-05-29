import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberLab CRM",
  description: "CRM operativo para barberias, peluquerias, spa de unas y tatuajes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
