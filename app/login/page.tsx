import { googleLoginAction, loginAction } from "./actions";
import { isDemoMode } from "@/lib/demo";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string; sent?: string };
}) {
  return (
    <main className="surface-grid grid min-h-dvh place-items-center p-3 sm:p-5">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 shadow-2xl shadow-slate-950/12 backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden min-h-[620px] bg-slate-950 p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.34),transparent_24rem),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.28),transparent_20rem)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="grid size-14 place-items-center rounded-2xl bg-white text-lg font-black text-slate-950">BL</div>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">BarberLab CRM</p>
              <h1 className="mt-4 max-w-md text-5xl font-black leading-tight tracking-tight">
                Control comercial para barberias que quieren escalar.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                Agenda, caja, inventario, turnos, comisiones y rentabilidad en una sola operacion.
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
              Usa clave o magic link segun el rol asignado en Supabase.
            </p>
            {isDemoMode() ? (
              <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
                <p className="font-black">Acceso demo local</p>
                <p className="mt-1">Email: admin@barberlab.local</p>
                <p>Password: BarberLab2026!</p>
              </div>
            ) : null}
            {searchParams.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">Credenciales invalidas.</p>}
            {searchParams.sent && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Magic link enviado.</p>}
            <form action={loginAction} className="mt-6 grid gap-4">
              <input type="hidden" name="next" value={searchParams.next || ""} />
              <label className="grid gap-2 text-sm font-bold">
                Email
                <input className="rounded-xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-500" name="email" type="email" required />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Password
                <input className="rounded-xl border bg-slate-50 px-4 py-3 outline-none focus:border-cyan-500" name="password" type="password" minLength={8} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" name="mode" value="password" type="submit">
                  Entrar
                </button>
                <button className="rounded-xl border px-4 py-3 text-sm font-black text-slate-800" name="mode" value="magic" type="submit">
                  Magic link
                </button>
              </div>
            </form>
            <form action={googleLoginAction} className="mt-3">
              <input type="hidden" name="next" value={searchParams.next || ""} />
              <button className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-black text-slate-800" type="submit">
                Ingresar con Google
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
