"use client";

import { useState, useTransition } from "react";
import { updateBilling } from "./actions";

type NegocioRow = {
  id: string;
  nombre: string;
  plan: string;
  estado: string;
  fechaFin: string | null;
  fechaInicio: string;
};

const COSTO: Record<string, number> = {
  starter:    90_000,
  pro:        180_000,
  enterprise: 450_000,
};

function statusLabel(estado: string, fechaFin: string | null) {
  if (estado !== "activo") return estado;
  if (!fechaFin) return "activo";
  const days = Math.ceil((new Date(fechaFin).getTime() - Date.now()) / 86400000);
  if (days < 0) return "vencido";
  if (days <= 7) return "por vencer";
  return "activo";
}

const statusStyle: Record<string, string> = {
  activo:      "bg-emerald-900/50 text-emerald-300",
  "por vencer":"bg-amber-900/50 text-amber-300",
  vencido:     "bg-rose-900/50 text-rose-300",
  suspendido:  "bg-amber-900/50 text-amber-300",
  cancelado:   "bg-rose-900/50 text-rose-300",
};

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400/40 transition";

export function FacturacionManager({ negocios }: { negocios: NegocioRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(fd: FormData) {
    startTransition(async () => {
      await updateBilling(fd);
      setEditing(null);
    });
  }

  return (
    <div
      className="overflow-hidden rounded-[2rem] border"
      style={{ background: "rgba(17,17,24,0.95)", borderColor: "rgba(255,255,255,0.09)" }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div>
          <h3 className="font-black text-white">Suscripciones activas</h3>
          <p className="text-xs text-slate-400">{negocios.length} comercios registrados</p>
        </div>
        <p className="text-xs font-bold text-slate-400">
          MRR base:{" "}
          <span className="text-cyan-400">
            ${negocios
              .filter((n) => n.estado === "activo")
              .reduce((s, n) => s + (COSTO[n.plan] ?? 0), 0)
              .toLocaleString("es-CO")}
          </span>
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-soft">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead
            className="text-[10px] uppercase tracking-wide"
            style={{ background: "#0d0d14", color: "#67e8f9" }}
          >
            <tr>
              <th className="px-5 py-3">Comercio</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Costo/mes</th>
              <th className="px-4 py-3">Renovación</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {negocios.map((n, i) => {
              const status = statusLabel(n.estado, n.fechaFin);
              const isEditing = editing === n.id;
              return (
                <tr
                  className="border-t"
                  key={n.id}
                  style={{
                    borderColor: "rgba(255,255,255,0.05)",
                    background: i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent",
                  }}
                >
                  <td className="px-5 py-3.5 font-semibold text-white">{n.nombre}</td>
                  <td className="px-4 py-3.5">
                    {isEditing ? (
                      <form id={`bf-${n.id}`} action={handleSave}>
                        <input type="hidden" name="negocioId" value={n.id} />
                        <select className={inputCls} name="plan" defaultValue={n.plan}>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </form>
                    ) : (
                      <span className="text-slate-300 capitalize">{n.plan}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    ${(COSTO[n.plan] ?? 0).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3.5">
                    {isEditing ? (
                      <input
                        className={inputCls}
                        form={`bf-${n.id}`}
                        name="fechaFin"
                        type="date"
                        defaultValue={n.fechaFin || ""}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">{n.fechaFin ?? "Sin fecha"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {isEditing ? (
                      <select
                        className={inputCls}
                        form={`bf-${n.id}`}
                        name="estado"
                        defaultValue={n.estado}
                      >
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    ) : (
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${statusStyle[status] ?? ""}`}>
                        {status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <button
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                          disabled={isPending}
                          form={`bf-${n.id}`}
                          style={{ background: "linear-gradient(135deg,#22d3ee,#7c3aed)" }}
                          type="submit"
                        >
                          {isPending ? "..." : "Guardar"}
                        </button>
                        <button
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/60 transition hover:text-white"
                          onClick={() => setEditing(null)}
                          style={{ background: "rgba(255,255,255,0.07)" }}
                          type="button"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/80 transition hover:text-white"
                        onClick={() => setEditing(n.id)}
                        style={{ background: "rgba(255,255,255,0.07)" }}
                        type="button"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
