"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { assignPlan } from "./actions";

const PLANS = [
  {
    id: "starter",
    nombre: "Starter",
    precio: 90000,
    color: "from-slate-700 to-slate-800",
    accent: "#94a3b8",
    features: ["Hasta 3 empleados", "1 sede", "Agenda básica", "Caja e inventario", "Reportes esenciales"],
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 180000,
    color: "from-violet-700 to-violet-900",
    accent: "#a78bfa",
    popular: true,
    features: ["Hasta 10 empleados", "Multi-sede", "Agenda avanzada", "Inventario completo", "Reportes avanzados", "Personalización visual", "Soporte prioritario"],
  },
  {
    id: "enterprise",
    nombre: "Enterprise",
    precio: 350000,
    color: "from-cyan-700 to-blue-900",
    accent: "#67e8f9",
    features: ["Empleados ilimitados", "Multi-sede ilimitado", "Todos los módulos", "API access", "Onboarding dedicado", "SLA garantizado", "Facturación electrónica"],
  },
] as const;

type Plan = (typeof PLANS)[number];

export default function SuperAdminPlanesPage() {
  const [assignModal, setAssignModal] = useState<{ plan: Plan } | null>(null);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.28),transparent_16rem),radial-gradient(circle_at_85%_70%,rgba(168,85,247,.28),transparent_18rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:mt-8">MRZLABS · Monetización</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Planes SaaS</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Configura planes, asigna a negocios y controla la facturación mensual.
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${plan.color} p-6 text-white shadow-xl`}
          >
            {"popular" in plan && plan.popular && (
              <span className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white/90 backdrop-blur">
                Más popular
              </span>
            )}
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">{plan.nombre}</p>
            <p className="mt-3 text-4xl font-black">
              ${plan.precio.toLocaleString("es-CO")}
              <span className="ml-1 text-sm font-medium opacity-60">/mes</span>
            </p>
            <ul className="mt-5 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm opacity-85">
                  <Check className="size-4 shrink-0 opacity-70" style={{ color: plan.accent }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="mt-6 w-full rounded-2xl border border-white/20 bg-white/10 py-3 text-sm font-black text-white transition hover:bg-white/20"
              onClick={() => setAssignModal({ plan })}
              type="button"
            >
              Asignar a negocio
            </button>
          </div>
        ))}
      </div>

      {assignModal && (
        <AssignPlanModal plan={assignModal.plan} onClose={() => setAssignModal(null)} />
      )}
    </div>
  );
}

function AssignPlanModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [negocioSlug, setNegocioSlug] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!negocioSlug.trim()) { setErr("Ingresa el slug del negocio"); return; }
    startTransition(async () => {
      try {
        await assignPlan(negocioSlug.trim(), plan.id);
        router.refresh();
        onClose();
      } catch (ex) {
        setErr((ex as Error).message ?? "Error al asignar");
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[8px]" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/3 z-50 mx-auto max-w-md rounded-[2rem] bg-slate-900 p-6 shadow-2xl border border-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Asignar plan</p>
        <h3 className="mt-1 text-xl font-black text-white">Plan {plan.nombre}</h3>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
            Slug del negocio
            <input
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/60"
              placeholder="ej. smart-style"
              value={negocioSlug}
              onChange={(e) => setNegocioSlug(e.target.value)}
              required
            />
          </label>
          {err && <p className="text-xs font-bold text-rose-400">{err}</p>}
          <div className="flex gap-3">
            <button type="button" className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-white/60 hover:text-white transition" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-2.5 text-sm font-black text-white disabled:opacity-50 transition">
              {pending ? "Asignando…" : "Asignar plan"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
