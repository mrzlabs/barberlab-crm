import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/roles";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(roleHome[profile.rol]);
}
