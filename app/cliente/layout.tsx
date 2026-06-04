import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/cliente/reservar", label: "Reservar" },
  { href: "/cliente/mis-citas", label: "Mis citas" },
];

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  try {
    const profile = await requireRole(["cliente"]);
    return <AppShell profile={profile} role="cliente" title={profile.nombre || "Cliente"} nav={nav}>{children}</AppShell>;
  } catch {
    redirect("/login");
  }
}
