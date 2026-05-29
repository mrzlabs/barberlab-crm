import type { UserRole } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";
import { AppChrome } from "@/components/layout/AppChrome";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  role,
  title,
  nav,
  children,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const mode = isDemoMode() ? "DEMO" : "PRODUCCION";

  return <AppChrome mode={mode} nav={nav} role={role} title={title}>{children}</AppChrome>;
}
