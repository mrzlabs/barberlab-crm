import Link from "next/link";
import { NeuralCanvas } from "@/components/layout/NeuralCanvas";

export default function UnauthorizedPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050709] p-6">
      <NeuralCanvas className="absolute inset-0 h-full w-full" darkMode />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,206,201,0.07),transparent),radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(108,92,231,0.07),transparent)]" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-white/8 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Acceso restringido</p>
        <h1 className="mt-3 text-2xl font-bold text-white">No tienes permiso para esta vista.</h1>
        <p className="mt-3 text-sm text-white/60">
          Usa una cuenta con rol autorizado o vuelve al inicio de sesion.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90"
          href="/login"
        >
          Ir a login
        </Link>
      </section>
    </main>
  );
}
