"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface MrzModalProps {
  open: boolean;
  onClose: () => void;
}

export function MrzModal({ open, onClose }: MrzModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(4,4,14,0.72)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] overflow-hidden rounded-[20px]"
        style={{
          background: "linear-gradient(160deg, #0d0d1e 0%, #0a0a18 100%)",
          border: "1px solid rgba(192,132,252,0.28)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "mrzModalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar X */}
        <button
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border border-white/15 bg-white/8 text-white/70 transition hover:bg-white/16 hover:text-white"
          onClick={onClose}
          type="button"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="px-6 pb-4 pt-6">
          <p
            className="text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(90deg, #00cec9, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MRZLABS
          </p>
          <p className="mt-1 text-sm text-white/55">
            Automatizamos lo operativo para que te enfoques en crecer.
          </p>
        </div>

        {/* Separador */}
        <div className="mx-6 border-t border-white/8" />

        {/* Servicios */}
        <ul className="grid gap-2 px-6 py-4">
          {[
            "CRM para negocios de agenda y caja",
            "Sitios web y landing pages",
            "Automatizaciones WhatsApp",
            "Integraciones Google Workspace",
            "Campañas Meta y Google Ads",
            "Soporte técnico continuo",
          ].map((s) => (
            <li key={s} className="flex items-center gap-2.5 text-sm text-white/72">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: "linear-gradient(135deg, #00cec9, #7c3aed)" }}
              />
              {s}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-6 py-4">
          <div className="flex gap-2">
            <a
              href="https://github.com/mrzlabs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-white/8 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/14 hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://mrzlabs.github.io/web-mrz-portfolio/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-white/8 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/14 hover:text-white"
            >
              Portafolio
            </a>
          </div>
          <span
            className="inline-flex cursor-not-allowed select-none items-center rounded-lg px-3 py-2 text-xs font-bold opacity-50"
            style={{ background: "rgba(37,211,102,0.18)", color: "#25d366" }}
            title="Próximamente"
          >
            WhatsApp — Próximamente
          </span>
        </div>
      </div>

      <style>{`
        @keyframes mrzModalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
