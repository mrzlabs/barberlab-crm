import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/super-admin/negocios", label: "Dashboard" },
];

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["super_admin"]);
  return <AppShell profile={profile} role="super_admin" title="MRZLABS SaaS" nav={nav}>{children}</AppShell>;
}
