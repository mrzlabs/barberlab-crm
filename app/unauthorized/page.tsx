import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Acceso restringido</p>
        <h1 className="mt-3 text-2xl font-bold">No tienes permiso para esta vista.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Usa una cuenta con rol autorizado o vuelve al inicio de sesion.
        </p>
        <Link className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/login">
          Ir a login
        </Link>
      </section>
    </main>
  );
}
