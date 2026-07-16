"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, Loader2, X } from "lucide-react";
import { updateNegocioSuperAdmin } from "./actions";
import { Badge } from "@/components/ui/Badge";

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

const editInput = "w-full rounded-control border border-ds-border bg-ds-surface px-3 py-2 text-sm text-ds-fg placeholder:text-ds-fg-subtle outline-none transition-colors focus:border-ds-primary focus:ring-2 focus:ring-ds-ring/60";
const editLbl = "grid gap-1.5 text-[13px] font-medium text-ds-fg";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  return (
    <button className="ml-1 inline-flex items-center rounded p-0.5 text-ds-fg-subtle transition-colors hover:text-ds-primary" onClick={handleCopy} type="button" title="Copiar">
      {copied ? <Check className="size-3 text-ds-success" /> : <Copy className="size-3" />}
    </button>
  );
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  try { return new Intl.DateTimeFormat("es-CO", { dateStyle: "short" }).format(new Date(d as string)); }
  catch { return "—"; }
}

const planTone: Record<string, "neutral" | "primary" | "success"> = { starter: "neutral", pro: "primary", enterprise: "success" };
const estadoTone: Record<string, "success" | "warning" | "danger"> = { activo: "success", suspendido: "warning", cancelado: "danger" };

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
      if (!res.ok || json.error) setFetchError(json.error ?? "Error al generar el acceso temporal");
      else setDrawer({ negocio, src: json.url });
    } catch {
      setFetchError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
        <div className="flex items-center justify-between border-b border-ds-border px-5 py-4">
          <div>
            <h3 className="font-semibold text-ds-fg">Clientes registrados</h3>
            <p className="text-[12px] text-ds-fg-muted">Multi-tenant por defecto, dedicado para enterprise.</p>
          </div>
          <span className="rounded-full bg-ds-surface-2 px-3 py-1 text-[11px] font-medium text-ds-fg-muted">{negocios.length} negocios</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-ds-border text-[11px] uppercase tracking-wide text-ds-fg-muted">
                <th className="px-5 py-2.5 font-medium">ID</th>
                <th className="px-5 py-2.5 font-medium">Negocio</th>
                <th className="px-5 py-2.5 font-medium">Slug</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5 font-medium">Admin email</th>
                <th className="px-4 py-2.5 font-medium">Registro</th>
                <th className="px-4 py-2.5 font-medium">Marca</th>
                <th className="px-4 py-2.5 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((n) => (
                <tr className="border-b border-ds-border last:border-0 hover:bg-ds-surface-2" key={n.id}>
                  <td className="px-5 py-3">
                    <span className="flex items-center font-mono text-[11px] text-ds-fg-subtle">{n.id.slice(0, 8)}…<CopyBtn text={n.id} /></span>
                  </td>
                  <td className="px-5 py-3 font-medium text-ds-fg">{n.nombre}</td>
                  <td className="px-5 py-3"><span className="flex items-center font-mono text-[12px] text-ds-fg-muted">{n.slug}<CopyBtn text={n.slug} /></span></td>
                  <td className="px-4 py-3"><Badge tone={planTone[n.plan] ?? "neutral"}><span className="capitalize">{n.plan}</span></Badge></td>
                  <td className="px-4 py-3"><Badge tone={estadoTone[n.estado] ?? "neutral"}><span className="capitalize">{n.estado}</span></Badge></td>
                  <td className="px-4 py-3 text-[12px] text-ds-fg-muted">{n.adminEmail ?? <span className="text-ds-fg-subtle">—</span>}</td>
                  <td className="px-4 py-3 text-[12px] text-ds-fg-subtle">{fmtDate(n.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {[n.colorPrimario, n.colorSecundario, n.colorAcento].map((c) => (
                        <span className="size-4 rounded-full border border-ds-border" key={c} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-control border border-ds-border px-2.5 py-1 text-[12px] font-medium text-ds-fg-muted transition-colors hover:border-ds-border-strong hover:text-ds-fg" onClick={() => setEdit(n)} type="button">Gestionar</button>
                      <Link className="rounded-control px-2.5 py-1 text-[12px] font-medium text-ds-fg-muted transition-colors hover:text-ds-fg" href={`/super-admin/negocios/${n.id}`}>Detalle</Link>
                      <button className="inline-flex items-center gap-1.5 rounded-control bg-ds-primary px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-ds-primary-hover disabled:opacity-50" disabled={loadingId === n.id} onClick={() => handleOperar(n)} type="button">
                        {loadingId === n.id && <Loader2 className="size-3 animate-spin" />} Operar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {negocios.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-ds-fg-subtle" colSpan={9}>Sin negocios registrados aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {fetchError && <div className="border-t border-ds-border px-5 py-3 text-sm font-medium text-ds-danger">{fetchError}</div>}
      </div>

      {/* Drawer operar (iframe) */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40 bg-ds-fg/40" onClick={() => setDrawer(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex min-w-[320px] flex-col border-l border-ds-border bg-ds-surface shadow-ds-lg" style={{ width: "60%" }}>
            <div className="flex shrink-0 items-center justify-between border-b border-ds-border px-5 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Modo editor</p>
                <h3 className="text-base font-semibold text-ds-fg">{drawer.negocio.nombre}</h3>
              </div>
              <button className="inline-flex items-center gap-2 rounded-control border border-ds-border-strong bg-ds-surface px-3 py-2 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" onClick={() => setDrawer(null)} type="button">
                <X className="size-4" /> Salir del editor
              </button>
            </div>
            <iframe className="w-full flex-1 border-0" src={drawer.src} title={`CRM — ${drawer.negocio.nombre}`} />
          </div>
        </>
      )}

      {/* Drawer editar */}
      {edit && (
        <>
          <div className="fixed inset-0 z-40 bg-ds-fg/40" onClick={() => setEdit(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(94vw,460px)] flex-col border-l border-ds-border bg-ds-surface shadow-ds-lg">
            <div className="flex items-center justify-between border-b border-ds-border px-5 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Gestionar negocio</p>
                <h3 className="text-base font-semibold text-ds-fg">{edit.nombre}</h3>
              </div>
              <button className="rounded-control p-1.5 text-ds-fg-subtle transition-colors hover:bg-ds-surface-2 hover:text-ds-fg" onClick={() => setEdit(null)} type="button" aria-label="Cerrar"><X className="size-4" /></button>
            </div>
            <form action={updateNegocioSuperAdmin} className="grid flex-1 content-start gap-4 overflow-y-auto p-5">
              <input name="id" type="hidden" value={edit.id} />
              <label className={editLbl}>Nombre<input className={editInput} name="nombre" defaultValue={edit.nombre} required /></label>
              <label className={editLbl}>Slug<input className={editInput} name="slug" defaultValue={edit.slug} required /></label>
              <label className={editLbl}>Teléfono<input className={editInput} name="telefono" defaultValue={edit.telefono || ""} /></label>
              <label className={editLbl}>Correo<input className={editInput} name="correo" type="email" defaultValue={edit.correo || ""} /></label>
              <label className={editLbl}>Dirección<input className={editInput} name="direccion" defaultValue={edit.direccion || ""} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={editLbl}>Plan
                  <select className={editInput} name="plan" defaultValue={edit.plan}>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </label>
                <label className={editLbl}>Estado
                  <select className={editInput} name="estado" defaultValue={edit.estado === "cancelado" ? "suspendido" : edit.estado}>
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </label>
              </div>
              <label className={editLbl}>Fecha fin<input className={editInput} name="fechaFin" type="date" defaultValue={edit.fechaFin || ""} /></label>
              <button className="mt-2 h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Guardar cambios</button>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
