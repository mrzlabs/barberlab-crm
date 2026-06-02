import { requireRole } from "@/lib/auth/session";
import { changePasswordAction } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500";

export default async function AdminPerfilPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const profile = await requireRole(["admin", "super_admin"]);

  return (
    <main className="surface-grid min-h-dvh p-4 sm:p-6">
      <section className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
          <div className="relative">
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Configuracion</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Cambiar contraseña</h1>
            <p className="mt-3 text-sm leading-6 crm-text-secondary">
              {profile.nombre} · {profile.email}
            </p>
          </div>
        </div>

        {searchParams.success ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            Contraseña actualizada correctamente.
          </p>
        ) : null}

        {searchParams.error === "current" ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            La contraseña actual es incorrecta.
          </p>
        ) : searchParams.error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            Datos inválidos. Verifica que las contraseñas coincidan y tengan mínimo 8 caracteres.
          </p>
        ) : null}

        <section className="glass-panel rounded-[2rem] p-6">
          <form action={changePasswordAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold">
              Contraseña actual
              <input className={input} name="currentPassword" type="password" minLength={8} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Nueva contraseña
              <input className={input} name="newPassword" type="password" minLength={8} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Confirmar nueva contraseña
              <input className={input} name="confirmPassword" type="password" minLength={8} required />
            </label>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">
              Actualizar contraseña
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
