"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton({
  className = "",
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button className={className} onClick={signOut} type="button" aria-label="Cerrar sesión">
      <LogOut className="size-4 shrink-0" />
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  );
}
