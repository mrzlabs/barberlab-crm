import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo-server";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["super_admin"]);
  const demoMode = await isDemoMode();
  return <SuperAdminChrome demoMode={demoMode} profile={profile}>{children}</SuperAdminChrome>;
}
