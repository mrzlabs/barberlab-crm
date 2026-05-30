"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Flash = { text: string; type: "ok" | "err" };

function ToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [flash, setFlash] = useState<Flash | null>(null);

  useEffect(() => {
    const ok = searchParams.get("ok");
    const err = searchParams.get("err");
    const msg = ok ?? err;
    if (!msg) return;

    setFlash({ text: decodeURIComponent(msg.replace(/\+/g, " ")), type: ok ? "ok" : "err" });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("ok");
    params.delete("err");
    const cleaned = params.size ? `${pathname}?${params}` : pathname;
    router.replace(cleaned, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(id);
  }, [flash]);

  if (!flash) return null;

  return (
    <div
      className={`fixed bottom-20 left-1/2 z-50 flex min-w-[260px] max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold shadow-2xl transition-all ${
        flash.type === "ok"
          ? "bg-emerald-600 text-white shadow-emerald-900/30"
          : "bg-red-600 text-white shadow-red-900/30"
      }`}
      role="status"
    >
      <span className="shrink-0 text-base">{flash.type === "ok" ? "✓" : "✕"}</span>
      <span className="flex-1">{flash.text}</span>
      <button
        className="shrink-0 text-white/60 hover:text-white"
        onClick={() => setFlash(null)}
        type="button"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}

export function SubmitToast() {
  return (
    <ToastInner />
  );
}
