import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/cliente/reservar", label: "Reservar" },
  { href: "/cliente/mis-citas", label: "Mis citas" },
];

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["cliente"]);
  return <AppShell role="cliente" title="Cliente" nav={nav}>{children}</AppShell>;
}
