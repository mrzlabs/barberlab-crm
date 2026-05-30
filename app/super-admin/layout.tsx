import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome";
import { requireRole } from "@/lib/auth/session";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["super_admin"]);
  return <SuperAdminChrome profile={profile}>{children}</SuperAdminChrome>;
}
