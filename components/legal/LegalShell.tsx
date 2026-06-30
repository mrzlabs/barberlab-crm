import Link from "next/link";
import type { ReactNode } from "react";

type LegalShellProps = {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalShell({ eyebrow, title, updated, children }: LegalShellProps) {
  return (
    <main className="min-h-dvh bg-slate-50 px-5 py-10 text-slate-700 sm:px-8 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <Link className="mb-10 inline-flex text-sm font-bold text-violet-700 hover:text-violet-900" href="/">
          ← Volver al inicio
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualización: {updated}</p>
        <div className="mt-8 border-t border-slate-200 pt-2 [&_a]:font-bold [&_a]:text-violet-700 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&_li]:mb-2 [&_li]:leading-7 [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_p]:leading-7 [&_strong]:font-bold [&_strong]:text-slate-950 [&_ul]:ml-6 [&_ul]:list-disc">
          {children}
        </div>
        <footer className="mt-14 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          Operux CRM · mrzlabs ·{" "}
          <a className="font-bold text-violet-700" href="mailto:contacto@mrzlabs.anonaddy.com">
            contacto@mrzlabs.anonaddy.com
          </a>
        </footer>
      </article>
    </main>
  );
}
