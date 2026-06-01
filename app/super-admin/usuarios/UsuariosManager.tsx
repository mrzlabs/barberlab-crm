"use client";

import { useState } from "react";
import { X } from "lucide-react";

type UsuarioRow = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
  negocioId: string | null;
  negocioNombre: string | null;
};

type NegocioOption = { id: string; nombre: string };

const rolStyles: Record<string, string> = {
  super_admin: "bg-violet-900/50 text-violet-300",
  admin:       "bg-cyan-900/50 text-cyan-300",
  empleado:    "bg-emerald-900/50 text-emerald-300",
  cliente:     "bg-slate-700/60 text-slate-300",
};

function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short" }).format(new Date(d));
}

export function UsuariosManager({
  usuarios,
  negocios,
}: {
  usuarios: UsuarioRow[];
  negocios: NegocioOption[];
}) {
  const [negocioFilter, setNegocioFilter] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [selected, setSelected] = useState<UsuarioRow | null>(null);

  const filtered = usuarios.filter((u) => {
    if (negocioFilter && u.negocioId !== negocioFilter) return false;
    if (rolFilter && u.rol !== rolFilter) return false;
    return true;
  });

  const inputCls =
    "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 transition";

  return (
    <>
      {/* ── Filters + Table ─────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-[2rem] border"
        style={{ background: "rgba(17,17,24,0.95)", borderColor: "rgba(255,255,255,0.09)" }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="font-black text-white">Usuarios registrados</h3>
            <p className="text-xs text-slate-400">{filtered.length} de {usuarios.length} usuarios</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={inputCls}
              value={negocioFilter}
              onChange={(e) => setNegocioFilter(e.target.value)}
            >
              <option value="">Todos los comercios</option>
              {negocios.map((n) => (
                <option key={n.id} value={n.id}>{n.nombre}</option>
              ))}
            </select>
            <select
              className={inputCls}
              value={rolFilter}
              onChange={(e) => setRolFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead
              className="text-[10px] uppercase tracking-wide"
              style={{ background: "#0d0d14", color: "#67e8f9" }}
            >
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Comercio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Registro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  className="cursor-pointer border-t transition"
                  key={u.id}
                  onClick={() => setSelected(u)}
                  style={{
                    borderColor: "rgba(255,255,255,0.05)",
                    background: i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "rgba(124,58,237,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent";
                  }}
                >
                  <td className="px-5 py-3.5 font-semibold text-white">{u.nombre}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${rolStyles[u.rol] ?? "bg-slate-700/60 text-slate-300"}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-300">{u.negocioNombre ?? <span className="text-slate-600">—</span>}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${u.activo ? "bg-emerald-900/50 text-emerald-300" : "bg-rose-900/50 text-rose-300"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    Sin usuarios con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────── */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-[min(90vw,400px)] flex-col border-l shadow-2xl"
            style={{ background: "#111118", borderColor: "rgba(255,255,255,0.09)" }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#22d3ee" }}>
                  Detalle usuario
                </p>
                <h3 className="mt-0.5 text-lg font-black text-white">{selected.nombre}</h3>
              </div>
              <button
                className="rounded-xl border p-2 text-white/50 transition hover:text-white"
                onClick={() => setSelected(null)}
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                type="button"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-3">
                {[
                  ["ID", selected.id],
                  ["Email", selected.email],
                  ["Rol", selected.rol],
                  ["Comercio", selected.negocioNombre ?? "Sin negocio"],
                  ["Estado", selected.activo ? "Activo" : "Inactivo"],
                  ["Registro", fmtDate(selected.createdAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border p-4"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-1 break-all text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
