"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, Loader2, X } from "lucide-react";
import { updateNegocioSuperAdmin } from "./actions";

type NegocioRow = {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
  estado: string;
  modoAislamiento: string;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  fechaFin: string | null;
  createdAt?: Date | string | null;
  adminEmail?: string | null;
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button className="ml-1 inline-flex items-center rounded-md p-0.5 text-slate-500 transition hover:text-cyan-400" onClick={handleCopy} type="button" title="Copiar">
      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
    </button>
  );
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  try { return new Intl.DateTimeFormat("es-CO", { dateStyle: "short" }).format(new Date(d as string)); }
  catch { return "—"; }
}

const planStyles: Record<string, string> = {
  starter:    "bg-slate-700/60 text-slate-300",
  pro:        "bg-violet-900/50 text-violet-300",
  enterprise: "bg-emerald-900/50 text-emerald-300",
};
const estadoStyles: Record<string, string> = {
  activo:     "bg-emerald-900/50 text-emerald-300",
  suspendido: "bg-amber-900/50 text-amber-300",
  cancelado:  "bg-rose-900/50 text-rose-300",
};

export function NegociosManager({ negocios }: { negocios: NegocioRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ negocio: NegocioRow; src: string } | null>(null);
  const [edit, setEdit] = useState<NegocioRow | null>(null);

  async function handleOperar(negocio: NegocioRow) {
    setLoadingId(negocio.id);
    setFetchError(null);
    try {
      const res = await fetch(`/api/impersonate/${negocio.id}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setFetchError(json.error ?? "Error al generar el acceso temporal");
      } else {
        setDrawer({ negocio, src: json.url });
      }
    } catch {
      setFetchError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      {/* ── Tabla ───────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-[2rem] border"
        style={{ background: "rgba(17,17,24,0.95)", borderColor: "rgba(255,255,255,0.09)" }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="font-black text-white">Clientes registrados</h3>
            <p className="text-xs text-slate-400">
              Modelo híbrido: multi-tenant por defecto, dedicado para enterprise.
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold text-slate-400"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {negocios.length} negocios
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead
              className="text-[10px] uppercase tracking-wide"
              style={{ background: "#0d0d14", color: "#67e8f9" }}
            >
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Negocio</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Admin email</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((n, i) => (
                <tr
                  className="border-t transition"
                  key={n.id}
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
                  <td className="px-5 py-3.5">
                    <span className="flex items-center font-mono text-[10px] text-slate-500">
                      {n.id.slice(0, 8)}…
                      <CopyBtn text={n.id} />
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-white">{n.nombre}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center font-mono text-xs text-slate-400">
                      {n.slug}
                      <CopyBtn text={n.slug} />
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${planStyles[n.plan] ?? "bg-slate-700/60 text-slate-300"}`}>
                      {n.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${estadoStyles[n.estado] ?? "bg-slate-700/60 text-slate-300"}`}>
                      {n.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{(n as { adminEmail?: string | null }).adminEmail ?? <span className="text-slate-600">—</span>}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{fmtDate((n as { createdAt?: Date | string | null }).createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {[n.colorPrimario, n.colorSecundario, n.colorAcento].map((c) => (
                        <span className="size-4 rounded-full border border-white/20" key={c} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/80 transition hover:text-white"
                        onClick={() => setEdit(n)}
                        type="button"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        Gestionar
                      </button>
                      <Link
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/55 transition hover:text-white"
                        href={`/super-admin/negocios/${n.id}`}
                      >
                        Detalle
                      </Link>
                      <button
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                        disabled={loadingId === n.id}
                        onClick={() => handleOperar(n)}
                        style={{ background: "linear-gradient(135deg,#22d3ee,#7c3aed)" }}
                        type="button"
                      >
                        {loadingId === n.id && <Loader2 className="size-3 animate-spin" />}
                        Operar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {negocios.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={9}>
                    Sin negocios registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {fetchError && (
          <div
            className="border-t px-5 py-3 text-sm font-bold text-rose-400"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {fetchError}
          </div>
        )}
      </div>

      {/* ── Drawer ──────────────────────────────────────────────── */}
      {drawer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawer(null)}
          />
          <div
            className="fixed inset-y-0 right-0 z-50 flex min-w-[320px] flex-col border-l shadow-2xl"
            style={{
              width: "60%",
              background: "#111118",
              borderColor: "rgba(255,255,255,0.09)",
            }}
          >
            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: "#22d3ee" }}
                >
                  Modo Editor
                </p>
                <h3 className="mt-0.5 text-lg font-black text-white">{drawer.negocio.nombre}</h3>
              </div>
              <button
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold text-white transition hover:bg-white/8"
                onClick={() => setDrawer(null)}
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                }}
                type="button"
              >
                <X className="size-4" />
                Salir del editor
              </button>
            </div>

            {/* iframe */}
            <iframe
              className="w-full flex-1 border-0"
              src={drawer.src}
              title={`CRM — ${drawer.negocio.nombre}`}
            />
          </div>
        </>
      )}

      {edit && (
        <>
          <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" onClick={() => setEdit(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(94vw,460px)] flex-col border-l border-white/10 bg-[#111118]/96 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Gestionar negocio</p>
                <h3 className="mt-1 text-lg font-black text-white">{edit.nombre}</h3>
              </div>
              <button className="rounded-xl border border-white/10 p-2 text-white/60 hover:text-white" onClick={() => setEdit(null)} type="button" aria-label="Cerrar">
                <X className="size-4" />
              </button>
            </div>
            <form action={updateNegocioSuperAdmin} className="grid flex-1 content-start gap-4 overflow-y-auto p-5">
              <input name="id" type="hidden" value={edit.id} />
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Nombre
                <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="nombre" defaultValue={edit.nombre} required />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Slug
                <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="slug" defaultValue={edit.slug} required />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Teléfono
                <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="telefono" defaultValue={edit.telefono || ""} />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Correo
                <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="correo" type="email" defaultValue={edit.correo || ""} />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Dirección
                <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="direccion" defaultValue={edit.direccion || ""} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Plan
                  <select className="rounded-xl border border-white/10 bg-[#171724] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="plan" defaultValue={edit.plan}>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Estado
                  <select className="rounded-xl border border-white/10 bg-[#171724] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="estado" defaultValue={edit.estado === "cancelado" ? "suspendido" : edit.estado}>
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Fecha fin
                <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" name="fechaFin" type="date" defaultValue={edit.fechaFin || ""} />
              </label>
              <button className="mt-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-600 px-4 py-3 text-sm font-black text-white" type="submit">
                Guardar cambios
              </button>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
