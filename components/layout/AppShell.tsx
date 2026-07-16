import type { UserRole } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo-server";
import { AppChrome } from "@/components/layout/AppChrome";
import type { CurrentProfile } from "@/lib/auth/session";
import type { AppAlert } from "@/lib/admin/queries";
import type { ConfigVisual } from "@/lib/db/schema";

type NavItem = { href: string; label: string };

export async function AppShell({
  role,
  title,
  nav,
  children,
  profile,
  alerts = [],
  configVisual,
  theme = "dark",
  isImpersonating: _isImpersonating,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  profile?: CurrentProfile;
  alerts?: AppAlert[];
  configVisual?: ConfigVisual | null;
  theme?: "light" | "dark";
  isImpersonating?: boolean;
}) {
  const mode = await isDemoMode() ? "DEMO" : "PRODUCCION";

  return (
    <AppChrome
      alerts={alerts}
      brand={profile}
      configVisual={configVisual}
      mode={mode}
      nav={nav}
      role={role}
      theme={theme}
      title={title}
    >
      {children}
    </AppChrome>
  );
}
