"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  agenda: "Agenda",
  turnos: "Turnos",
  gastos: "Gastos",
  inventario: "Inventario",
  servicios: "Servicios",
  empleados: "Empleados",
  clientes: "Clientes",
  reportes: "Reportes",
  configuracion: "Configuración",
  perfil: "Perfil",
  "super-admin": "SaaS Admin",
  negocios: "Negocios",
  usuarios: "Usuarios",
  planes: "Planes",
  facturacion: "Facturación",
  logs: "Logs",
  "mi-agenda": "Mi agenda",
  "cerrar-turno": "Cerrar turno",
  "mis-citas": "Mis citas",
  reservar: "Reservar",
};

function segmentLabel(seg: string) {
  if (LABELS[seg]) return LABELS[seg];
  // UUID or ID: truncate
  if (/^[0-9a-f-]{8,}$/i.test(seg)) return `#${seg.slice(0, 6)}`;
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Only show when 2+ deep
  if (segments.length < 2) return null;

  const crumbs = segments.map((seg, i) => ({
    label: segmentLabel(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-[11px] font-semibold" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3 text-white/30" />}
          {crumb.isLast ? (
            <span className="text-white/70">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-white/40 transition hover:text-white/70">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
