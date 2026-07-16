"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Copy, Check, X, KeyRound } from "lucide-react";
import { toggleUsuarioActivo, deleteUsuario, resetPassword } from "./actions";

type UsuarioRow = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
  negocioId: string | null;
  negocioNombre: string | null;
  lastSignIn?: string | null;
};

type NegocioOption = { id: string; nombre: string };

const rolStyles: Record<string, string> = {
  super_admin: "bg-violet-900/50 text-auto",
  admin:       "bg-ds-primary-tint text-ds-primary",
  empleado:    "bg-emerald-900/50 text-auto",
  cliente:     "bg-slate-700/60 text-auto",
};

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  try { return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(new Date(d)); }
  catch { return "—"; }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      className="ml-1 inline-flex items-center rounded-md p-0.5 text-ds-fg-subtle transition hover:text-ds-primary"
      onClick={handleCopy}
      type="button"
      title={`Copiar ${label}`}
    >
      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
    </button>
  );
}

export function UsuariosManager({
  usuarios,
  negocios,
  page,
  totalPages,
  total,
  currentQ,
  currentNegocio,
  currentRol,
}: {
  usuarios: UsuarioRow[];
  negocios: NegocioOption[];
  page: number;
  totalPages: number;
  total: number;
  currentQ: string;
  currentNegocio: string;
  currentRol: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<UsuarioRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [resetModal, setResetModal] = useState<{ userId: string; nombre: string; newPassword: string | null } | null>(null);
  const [resetting, setResetting] = useState(false);

  function buildUrl(overrides: Record<string, string | number>) {
    const p = new URLSearchParams({
      page: String(page),
      q: currentQ,
      negocio: currentNegocio,
      rol: currentRol,
      ...overrides,
    });
    for (const [k, v] of Array.from(p.entries())) if (!v || v === "1") p.delete(k);
    return `/super-admin/usuarios?${p}`;
  }

  async function handleResetPassword(userId: string, nombre: string) {
    setResetting(true);
    const result = await resetPassword(userId);
    setResetting(false);
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      setResetModal({ userId, nombre, newPassword: result.newPassword });
    }
  }

  const inputCls =
    "rounded-control border border-ds-border bg-ds-surface px-3 py-2 text-sm text-ds-fg placeholder:text-ds-fg-subtle outline-none transition-colors focus:border-ds-primary focus:ring-2 focus:ring-ds-ring/60";

  return (
    <>
      {/* ── Filters + Table ─────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-card border"
        style={{ background: "var(--ds-surface)", borderColor: "var(--ds-border)" }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: "var(--ds-border)" }}
        >
          <div>
            <h3 className="font-semibold text-ds-fg">Usuarios registrados</h3>
            <p className="text-xs text-ds-fg-muted">{total} usuarios · página {page}/{Math.max(1, totalPages)}</p>
          </div>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              router.push(buildUrl({ q: String(fd.get("q") ?? ""), negocio: String(fd.get("negocio") ?? ""), rol: String(fd.get("rol") ?? ""), page: 1 }));
            }}
          >
            <input className={`${inputCls} w-40`} defaultValue={currentQ} name="q" placeholder="Buscar…" type="search" />
            <select className={inputCls} defaultValue={currentNegocio} name="negocio">
              <option value="">Todos los comercios</option>
              {negocios.map((n) => (<option key={n.id} value={n.id}>{n.nombre}</option>))}
            </select>
            <select className={inputCls} defaultValue={currentRol} name="rol">
              <option value="">Todos los roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
              <option value="cliente">Cliente</option>
            </select>
            <button className="h-control rounded-control bg-ds-primary px-3 text-xs font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Filtrar</button>
          </form>
        </div>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wide" style={{ background: "var(--ds-surface-2)", color: "var(--ds-fg-muted)" }}>
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Comercio</th>
                <th className="px-4 py-3">Negocio ID</th>
                <th className="px-4 py-3">Usuario ID</th>
                <th className="px-4 py-3">Último acceso</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr
                  className="cursor-pointer border-t transition"
                  key={u.id}
                  onClick={() => setSelected(u)}
                  style={{
                    borderColor: "rgba(255,255,255,0.05)",
                    background: i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(124,58,237,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent"; }}
                >
                  <td className="px-5 py-3.5 font-semibold text-ds-fg">{u.nombre}</td>
                  <td className="px-5 py-3.5 text-xs text-ds-fg-muted">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${rolStyles[u.rol] ?? "bg-slate-700/60 text-ds-fg-muted"}`}>{u.rol}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-ds-fg-muted">{u.negocioNombre ?? <span className="text-ds-fg-subtle">—</span>}</td>
                  <td className="px-4 py-3.5">
                    {u.negocioId ? (
                      <span className="flex items-center font-mono text-[10px] text-ds-fg-subtle">
                        {u.negocioId.slice(0, 8)}…
                        <CopyButton text={u.negocioId} label="negocio_id" />
                      </span>
                    ) : <span className="text-ds-fg-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center font-mono text-[10px] text-ds-fg-subtle">
                      {u.id.slice(0, 8)}…
                      <CopyButton text={u.id} label="usuario_id" />
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ds-fg-subtle">{fmtDate(u.lastSignIn)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-auto ${u.activo ? "bg-emerald-900/50" : "bg-rose-900/50"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      <button
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${u.activo ? "bg-amber-900/40 text-amber-300 hover:bg-amber-900/60" : "bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60"}`}
                        disabled={pending}
                        onClick={() => startTransition(async () => { await toggleUsuarioActivo(u.id, !u.activo); router.refresh(); })}
                        type="button"
                      >
                        {u.activo ? "Inactivar" : "Activar"}
                      </button>
                      <button
                        className="flex items-center gap-1 rounded-lg bg-violet-900/40 px-2 py-1 text-[11px] font-bold text-ds-primary transition hover:bg-violet-900/70 disabled:opacity-50"
                        disabled={pending || resetting}
                        onClick={() => handleResetPassword(u.id, u.nombre)}
                        type="button"
                        title="Resetear clave"
                      >
                        <KeyRound className="size-3" /> Resetear clave
                      </button>
                      <button
                        className="rounded-lg bg-rose-900/40 px-2 py-1 text-[11px] font-bold text-ds-danger transition hover:bg-rose-900/70"
                        disabled={pending}
                        onClick={() => { if (window.confirm(`¿Eliminar a ${u.nombre}?`)) startTransition(async () => { await deleteUsuario(u.id); router.refresh(); }); }}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-ds-fg-subtle" colSpan={9}>Sin usuarios con ese filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: "var(--ds-border)" }}>
            <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-ds-fg-muted transition hover:text-ds-fg disabled:opacity-30" disabled={page <= 1} onClick={() => router.push(buildUrl({ page: page - 1 }))} type="button">
              <ChevronLeft className="size-4" /> Anterior
            </button>
            <span className="text-xs text-ds-fg-subtle">Página {page} de {totalPages}</span>
            <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-ds-fg-muted transition hover:text-ds-fg disabled:opacity-30" disabled={page >= totalPages} onClick={() => router.push(buildUrl({ page: page + 1 }))} type="button">
              Siguiente <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Modal resetear clave ──────────────────────────────────── */}
      {resetModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setResetModal(null)} />
          <div className="fixed left-1/2 top-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-ds-border bg-[#111118] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ds-primary">Clave reseteada</p>
              <button className="rounded-xl border border-ds-border p-1.5 text-ds-fg-muted hover:text-ds-fg" onClick={() => setResetModal(null)} type="button" aria-label="Cerrar"><X className="size-4" /></button>
            </div>
            <p className="text-sm text-ds-fg-muted mb-4">Nueva clave generada para <strong className="text-ds-fg">{resetModal.nombre}</strong>. Cópiala y comunícala al usuario.</p>
            {resetModal.newPassword ? (
              <div className="flex items-center gap-3 rounded-2xl border border-ds-border bg-ds-surface-2 px-4 py-3">
                <code className="flex-1 font-mono text-lg font-semibold tracking-widest text-ds-primary">{resetModal.newPassword}</code>
                <button
                  className="h-control rounded-control bg-ds-primary px-3 text-xs font-medium text-white transition-colors hover:bg-ds-primary-hover"
                  onClick={() => navigator.clipboard.writeText(resetModal.newPassword!)}
                  type="button"
                >
                  Copiar
                </button>
              </div>
            ) : (
              <p className="text-sm text-ds-danger">Error al generar la clave.</p>
            )}
            <p className="mt-3 text-xs text-ds-fg-subtle">El usuario deberá cambiar su contraseña en el próximo inicio de sesión.</p>
          </div>
        </>
      )}

      {/* ── Detail panel ────────────────────────────────────────── */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(90vw,400px)] flex-col border-l shadow-2xl" style={{ background: "var(--ds-surface)", borderColor: "var(--ds-border)" }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--ds-border)" }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#22d3ee" }}>Detalle usuario</p>
                <h3 className="mt-0.5 text-lg font-semibold text-ds-fg">{selected.nombre}</h3>
              </div>
              <button className="rounded-xl border p-2 text-ds-fg-muted transition hover:text-ds-fg" onClick={() => setSelected(null)} style={{ borderColor: "var(--ds-border)", background: "var(--ds-surface-2)" }} type="button" aria-label="Cerrar"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-3">
                {([
                  ["Usuario ID", selected.id],
                  ["Email", selected.email],
                  ["Rol", selected.rol],
                  ["Negocio ID", selected.negocioId ?? "Sin negocio"],
                  ["Comercio", selected.negocioNombre ?? "Sin negocio"],
                  ["Estado", selected.activo ? "Activo" : "Inactivo"],
                  ["Registro", fmtDate(selected.createdAt)],
                  ["Último acceso", fmtDate(selected.lastSignIn)],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="rounded-2xl border p-4" style={{ background: "var(--ds-surface-2)", borderColor: "var(--ds-border)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ds-fg-muted">{label}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="break-all text-sm font-semibold text-ds-fg">{value}</p>
                      {(label === "Usuario ID" || label === "Negocio ID") && value !== "Sin negocio" && (
                        <CopyButton text={value} label={label} />
                      )}
                    </div>
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
