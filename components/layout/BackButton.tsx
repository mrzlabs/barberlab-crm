"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const depth = pathname.split("/").filter(Boolean).length;

  // Only show on 3rd level or deeper (e.g. /admin/clientes/[id])
  if (depth < 3) return null;

  return (
    <button
      onClick={() => router.back()}
      className="fixed bottom-20 right-4 z-30 flex size-12 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition hover:scale-105 hover:bg-slate-900 lg:hidden"
      type="button"
      aria-label="Volver"
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}
