import { loginAction } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string; sent?: string };
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">BarberLab CRM</p>
        <h1 className="mt-3 text-2xl font-bold">Ingreso seguro</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Usa clave o magic link segun el rol asignado en Supabase.
        </p>
        {searchParams.error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Credenciales invalidas.</p>}
        {searchParams.sent && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Magic link enviado.</p>}
        <form action={loginAction} className="mt-6 grid gap-4">
          <input type="hidden" name="next" value={searchParams.next || ""} />
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input className="rounded-lg border px-3 py-2" name="email" type="email" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input className="rounded-lg border px-3 py-2" name="password" type="password" minLength={8} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" name="mode" value="password" type="submit">
              Entrar
            </button>
            <button className="rounded-lg border px-4 py-2 text-sm font-semibold" name="mode" value="magic" type="submit">
              Magic link
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
