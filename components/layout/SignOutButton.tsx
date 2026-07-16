"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/perfil/actions";

export function SignOutButton({
  className = "",
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  async function signOut() {
    await logoutAction();
  }

  return (
    <button className={className} onClick={signOut} type="button" aria-label="Cerrar sesión">
      <LogOut className="size-4 shrink-0" />
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  );
}
