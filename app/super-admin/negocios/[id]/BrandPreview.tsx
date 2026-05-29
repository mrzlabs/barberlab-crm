"use client";

import { useEffect, useState } from "react";

export function BrandPreview({
  defaultNombre,
  defaultPlan,
  defaultEstado,
  defaultPrimario,
  defaultSecundario,
  defaultAcento,
}: {
  defaultNombre: string;
  defaultPlan: string;
  defaultEstado: string;
  defaultPrimario: string;
  defaultSecundario: string;
  defaultAcento: string;
}) {
  const [nombre,    setNombre]    = useState(defaultNombre);
  const [plan,      setPlan]      = useState(defaultPlan);
  const [estado,    setEstado]    = useState(defaultEstado);
  const [primario,  setPrimario]  = useState(defaultPrimario);
  const [secundario,setSecundario]= useState(defaultSecundario);
  const [acento,    setAcento]    = useState(defaultAcento);

  // escucha cambios en el formulario hermano por delegación en el padre
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form[data-brand-form]");
    if (!form) return;
    const handle = () => {
      const fd = new FormData(form);
      setNombre(    (fd.get("nombre")         as string) || defaultNombre);
      setPlan(      (fd.get("plan")           as string) || defaultPlan);
      setEstado(    (fd.get("estado")         as string) || defaultEstado);
      setPrimario(  (fd.get("colorPrimario")  as string) || defaultPrimario);
      setSecundario((fd.get("colorSecundario")as string) || defaultSecundario);
      setAcento(    (fd.get("colorAcento")    as string) || defaultAcento);
    };
    form.addEventListener("input", handle);
    form.addEventListener("change", handle);
    return () => {
      form.removeEventListener("input", handle);
      form.removeEventListener("change", handle);
    };
  }, [defaultNombre, defaultPlan, defaultEstado, defaultPrimario, defaultSecundario, defaultAcento]);

  const initials = nombre.slice(0, 2).toUpperCase();

  return (
    <aside className="glass-panel rounded-[2rem] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">Vista previa en vivo</p>

      {/* brand card */}
      <div
        className="mt-4 overflow-hidden rounded-[1.6rem] p-5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${primario} 0%, ${acento} 100%)` }}
      >
        <div
          className="grid size-14 place-items-center overflow-hidden rounded-2xl bg-white/90 text-lg font-black shadow"
          style={{ color: primario }}
        >
          {initials}
        </div>
        <h4 className="mt-4 text-2xl font-black leading-tight">{nombre || "Nombre negocio"}</h4>
        <p className="mt-1 text-sm text-white/70 capitalize">Plan {plan} · {estado}</p>

        {/* paleta */}
        <div className="mt-4 flex items-center gap-2">
          {[primario, secundario, acento].map((c, i) => (
            <span
              key={i}
              className="size-7 rounded-full border-2 border-white/40 shadow"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <span className="ml-2 text-[11px] font-bold text-white/60 font-mono">{primario}</span>
        </div>
      </div>

      {/* sidebar mock */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `2px solid ${primario}20` }}>
          <div className="size-6 rounded-lg font-black text-[10px] grid place-items-center text-white" style={{ backgroundColor: primario }}>
            {initials.slice(0, 1)}
          </div>
          <span className="text-xs font-black" style={{ color: primario }}>{nombre || "Negocio"}</span>
        </div>
        {["Dashboard", "Agenda", "Turnos"].map((item) => (
          <div key={item} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 border-b border-slate-100">
            <span className="size-2 rounded-full" style={{ backgroundColor: `${primario}60` }} />
            {item}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Los colores se actualizan en tiempo real. Guarda para aplicar al negocio.
      </p>
    </aside>
  );
}
