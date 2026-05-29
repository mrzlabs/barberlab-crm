import type { UserRole } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";
import { AppChrome } from "@/components/layout/AppChrome";
import type { CurrentProfile } from "@/lib/auth/session";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  role,
  title,
  nav,
  children,
  profile,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  profile?: CurrentProfile;
}) {
  const mode = isDemoMode() ? "DEMO" : "PRODUCCION";

  return <AppChrome brand={profile} mode={mode} nav={nav} role={role} title={title}>{children}</AppChrome>;
}
