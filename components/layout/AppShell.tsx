import type { UserRole } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";
import { AppChrome } from "@/components/layout/AppChrome";
import type { CurrentProfile } from "@/lib/auth/session";
import type { AppAlert } from "@/lib/admin/queries";

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
  alerts = [],
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  profile?: CurrentProfile;
  alerts?: AppAlert[];
}) {
  const mode = isDemoMode() ? "DEMO" : "PRODUCCION";

  return <AppChrome alerts={alerts} brand={profile} mode={mode} nav={nav} role={role} title={title}>{children}</AppChrome>;
}
