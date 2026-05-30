"use client";

import { useMemo } from "react";

type CitaGrid = {
  id: string;
  inicio: string;
  fin: string;
  estado: string;
  empleadoId: string;
  cliente: string;
  servicio: string;
  empleado: string;
};

type EmpleadoCol = { id: string; nombre: string };

const START_HOUR = 7;
const END_HOUR = 21;
const PX_PER_MIN = 1.4;
const GRID_H = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function statusCls(estado: string) {
  if (estado === "realizada")  return "bg-emerald-50 border-emerald-300 text-emerald-900";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-50 border-red-300 text-red-800";
  if (estado === "confirmada") return "bg-violet-50 border-violet-300 text-violet-900";
  return "bg-cyan-50 border-cyan-300 text-cyan-900";
}

function minutesFromMidnight(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function AgendaCalendar({
  citas,
  empleados,
}: {
  citas: CitaGrid[];
  empleados: EmpleadoCol[];
}) {
  const cols = useMemo(
    () => empleados.filter((e) => citas.some((c) => c.empleadoId === e.id) || true),
    [citas, empleados],
  );

  function top(iso: string) {
    return Math.max(0, (minutesFromMidnight(iso) - START_HOUR * 60) * PX_PER_MIN);
  }

  function height(inicioIso: string, finIso: string) {
    const mins = (new Date(finIso).getTime() - new Date(inicioIso).getTime()) / 60000;
    return Math.max(mins * PX_PER_MIN, 20);
  }

  function fmt(iso: string) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  if (cols.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-400">
        Sin empleados registrados para mostrar en el calendario.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      {/* cabecera de columnas */}
      <div className="flex border-b border-slate-200 bg-slate-950 sticky top-0 z-10">
        <div className="w-14 shrink-0 border-r border-white/10" />
        {cols.map((emp) => (
          <div key={emp.id} className="flex-1 min-w-[150px] border-r border-white/10 last:border-r-0 px-3 py-3 text-center">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-200 truncate">{emp.nombre}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {citas.filter((c) => c.empleadoId === emp.id).length} citas
            </p>
          </div>
        ))}
      </div>

      {/* grid de tiempo */}
      <div className="flex" style={{ height: `${GRID_H}px` }}>
        {/* etiquetas de hora */}
        <div className="relative w-14 shrink-0 border-r border-slate-100 bg-slate-50/50">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute right-2 text-[10px] font-bold text-slate-400 leading-none"
              style={{ top: `${(h - START_HOUR) * 60 * PX_PER_MIN - 6}px` }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* columnas por empleado */}
        {cols.map((emp, ci) => {
          const empCitas = citas.filter((c) => c.empleadoId === emp.id);
          return (
            <div
              key={emp.id}
              className={`relative flex-1 min-w-[150px] border-r border-slate-100 last:border-r-0 ${ci % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
            >
              {/* líneas de hora */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-slate-100"
                  style={{ top: `${(h - START_HOUR) * 60 * PX_PER_MIN}px` }}
                />
              ))}
              {/* líneas de media hora */}
              {hours.map((h) => (
                <div
                  key={`${h}h`}
                  className="absolute inset-x-0 border-t border-dashed border-slate-50"
                  style={{ top: `${(h - START_HOUR + 0.5) * 60 * PX_PER_MIN}px` }}
                />
              ))}

              {/* citas */}
              {empCitas.map((cita) => {
                const t = top(cita.inicio);
                const h = height(cita.inicio, cita.fin);
                return (
                  <div
                    key={cita.id}
                    className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 ${statusCls(cita.estado)}`}
                    style={{ top: `${t}px`, height: `${h}px` }}
                    title={`${cita.cliente} · ${cita.servicio} · ${fmt(cita.inicio)}–${fmt(cita.fin)}`}
                  >
                    <p className="text-[10px] font-black leading-tight truncate">{cita.cliente}</p>
                    {h > 28 && <p className="text-[9px] leading-tight truncate opacity-70">{cita.servicio}</p>}
                    {h > 42 && <p className="text-[9px] leading-tight opacity-60">{fmt(cita.inicio)}–{fmt(cita.fin)}</p>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
