"use client";

import { X } from "lucide-react";

interface MrzModalProps {
  open: boolean;
  onClose: () => void;
}

export function MrzModal({ open, onClose }: MrzModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(9,5,25,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[760px] overflow-hidden rounded-[18px] border"
        style={{
          background: "rgba(9,5,25,0.92)",
          border: "1px solid rgba(192,132,252,0.42)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          animation: "mrzModalIn 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-2.5 top-2.5 z-10 grid size-8 place-items-center rounded-full border border-white/20 bg-white/8 text-white transition hover:bg-white/15"
          onClick={onClose}
          type="button"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {/* Arquitectura */}
          <div className="rounded-xl border border-white/14 bg-white/4 p-5">
            <strong className="block text-[11px] font-black uppercase tracking-[0.14em] text-violet-400 mb-2">
              Arquitectura progresiva
            </strong>
            <p className="text-[13px] leading-relaxed text-white/70">
              Infraestructura digital escalable para comercios que quieren operar con datos, roles y evidencia.
            </p>
            <ol className="mt-3 grid gap-1.5 pl-4 text-[12px] leading-relaxed text-white/60 list-decimal">
              <li>Analizamos operación, agenda, caja e inventario.</li>
              <li>Diseñamos flujos por rol y permisos.</li>
              <li>Construimos módulos medibles.</li>
              <li>Dejamos reportes para decidir con margen real.</li>
            </ol>
          </div>

          {/* MRZLABS */}
          <div className="rounded-xl border border-white/14 bg-white/4 p-5">
            <strong className="block text-[11px] font-black uppercase tracking-[0.14em] text-violet-400 mb-2">
              MRZLABS
            </strong>
            <p className="text-[13px] leading-relaxed text-white/70">
              Producto CRM modular para barberías, salones y comercios de atención por agenda.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://github.com/mrzlabs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-violet-700 px-3.5 py-2.5 text-[13px] font-black text-white transition hover:bg-violet-600"
              >
                GitHub
              </a>
              <a
                href="https://mrzlabs.github.io/web-mrz-portfolio/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-violet-700 px-3.5 py-2.5 text-[13px] font-black text-white transition hover:bg-violet-600"
              >
                Portafolio
              </a>
              <a
                href="#"
                aria-disabled="true"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center justify-center rounded-lg px-3.5 py-2.5 text-[13px] font-black text-white/60 cursor-not-allowed select-none"
                style={{ background: "rgba(37,211,102,0.25)", opacity: 0.6 }}
                title="Próximamente"
              >
                WhatsApp — Próximamente
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mrzModalIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
