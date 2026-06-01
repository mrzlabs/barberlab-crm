import { loginAction } from "./actions";
import { demoUsers, isDemoMode } from "@/lib/demo";

const errorMsg: Record<string, string> = {
  invalid: "Datos incompletos o formato invalido.",
  auth: "El usuario no existe en Auth o la contraseña no coincide.",
  profile: "La cuenta existe en Auth, pero no tiene perfil interno vinculado.",
  inactive: "La cuenta o el comercio estan inactivos.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="surface-grid grid min-h-dvh place-items-center p-3 text-slate-950 sm:p-5">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 shadow-2xl shadow-slate-950/12 backdrop-blur-2xl lg:grid-cols-[1.04fr_0.96fr]">
        <div className="relative hidden min-h-[620px] bg-[#070a13] p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(45,212,191,0.34),transparent_22rem),radial-gradient(circle_at_80%_68%,rgba(124,58,237,0.34),transparent_20rem),linear-gradient(135deg,rgba(255,255,255,.08),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex size-16 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-lg font-black text-cyan-200 shadow-2xl shadow-cyan-500/20">BL</div>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">BarberLab CRM</p>
              <h1 className="mt-4 max-w-lg text-5xl font-black leading-tight tracking-tight">
                Gestion comercial clara para barberias y salones.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                Agenda, caja, inventario, turnos, comisiones y rentabilidad conectados en una sola operacion.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl border border-cyan-300/10 bg-white/8 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Turnos hoy</span>
                <strong className="text-cyan-300">Operativo</strong>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/4 rounded-full bg-cyan-300" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 text-center text-xs font-bold text-slate-300">
                <span className="rounded-xl bg-white/10 p-3">Caja</span>
                <span className="rounded-xl bg-white/10 p-3">Agenda</span>
                <span className="rounded-xl bg-white/10 p-3">Stock</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 p-6 text-slate-950 sm:p-10">
          <div className="lg:hidden">
            <div className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-cyan-300">BL</div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-primary">BarberLab CRM</p>
          </div>
          <div className="mt-8 lg:mt-20">
            <p className="hidden text-xs font-black uppercase tracking-[0.18em] text-primary lg:block">BarberLab CRM</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Ingreso seguro</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Usa el acceso creado para tu rol. El sistema valida Auth, perfil interno y comercio activo.
            </p>
            {isDemoMode() ? (
              <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
                <p className="font-black">Acceso demo local</p>
                <div className="mt-2 grid gap-1 text-xs">
                  {demoUsers.map((user) => (
                    <p key={user.email}>
                      <span className="font-black capitalize">{user.role.replace("_", " ")}:</span> {user.email}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold">Password: BarberLab2026!</p>
              </div>
            ) : null}
            {searchParams.error ? (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
                {errorMsg[searchParams.error] || "No se pudo iniciar sesion."}
              </p>
            ) : (
              <div className="mt-4 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-bold text-slate-600 sm:grid-cols-3">
                <span>Auth</span>
                <span>Perfil</span>
                <span>Rol activo</span>
              </div>
            )}
            <form action={loginAction} className="mt-6 grid gap-4">
              <input type="hidden" name="next" value={searchParams.next || ""} />
              <label className="grid gap-2 text-sm font-bold">
                Email
                <input className="rounded-xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-500" name="email" type="email" required />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Password
                <input className="rounded-xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-500" name="password" type="password" minLength={8} required />
              </label>
              <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
