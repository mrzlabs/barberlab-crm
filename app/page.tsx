import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/roles";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(roleHome[profile.rol]);

  const modules = [
    ["Agenda", "Organiza citas, disponibilidad y atención desde una vista operativa."],
    ["Clientes", "Centraliza historial, preferencias, servicios y seguimiento."],
    ["Equipo", "Controla turnos, producción, comisiones y permisos por rol."],
    ["Inventario", "Registra existencias, consumos, costos y alertas de reposición."],
    ["Finanzas", "Consolida ventas, gastos, propinas y rendimiento del negocio."],
    ["Reportes", "Convierte la operación diaria en indicadores para decidir."],
  ];

  return (
    <main className="min-h-dvh bg-[#050709] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link className="text-xl font-black tracking-tight" href="/">Operux</Link>
          <Link className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-400" href="/login">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-8 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,206,201,0.14),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(108,92,231,0.18),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">CRM operativo para servicios personales</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            Tu negocio, en orden.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Gestiona agenda, clientes, equipo, inventario y resultados en una sola plataforma diseñada
            para barberías, peluquerías, centros de uñas y estudios de tatuajes.
          </p>
          <Link className="mt-9 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3.5 text-sm font-black shadow-lg shadow-violet-950" href="/login">
            Acceder a Operux
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">Operación centralizada</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">Control diario con datos trazables</h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description]) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6" key={title}>
              <h3 className="font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Operux CRM · mrzlabs</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Información legal">
            <Link className="hover:text-white" href="/terminos">Términos y Condiciones</Link>
            <Link className="hover:text-white" href="/privacidad">Política de Privacidad</Link>
            <Link className="hover:text-white" href="/privacidad">Tratamiento de datos</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
