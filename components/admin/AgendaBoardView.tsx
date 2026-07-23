"use client";

import { Plus } from "lucide-react";

const PALETTE = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777"];

type Cita = {
  id: string;
  inicio: Date | string;
  fin: Date | string;
  estado: string;
  empleadoId: string;
  cliente: string;
  servicio: string;
};

type Empleado = { id: string; nombre: string; activo: boolean };
type Props = { citas: Cita[]; empleados: Empleado[]; fecha: string };

function fmtHour(date: Date | string): string {
  return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/Bogota" }).format(new Date(date));
}

/** Clave de día (YYYY-MM-DD) en zona del negocio, para agrupar. */
function diaKey(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date(date));
}

/** Etiqueta corta del día, ej. "mié 23 jul". Marca Hoy / Mañana. */
function diaLabel(date: Date | string): string {
  const key = diaKey(date);
  const hoy = diaKey(new Date());
  const manana = diaKey(new Date(Date.now() + 86400000));
  if (key === hoy) return "Hoy";
  if (key === manana) return "Mañana";
  return new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Bogota" }).format(new Date(date));
}

const badge = "absolute right-2.5 top-2.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium";

export function AgendaBoardView({ citas, empleados, fecha }: Props) {
  const now = new Date();
  const activeEmpleados = empleados.filter((e) => e.activo);
  const isEnCurso = (c: Cita) => now >= new Date(c.inicio) && now <= new Date(c.fin);

  return (
    <div className="flex items-start gap-3.5 overflow-x-auto pb-4">
      {activeEmpleados.map((emp, colIdx) => {
        const color = PALETTE[colIdx % PALETTE.length];
        const empCitas = citas
          .filter((c) => c.empleadoId === emp.id)
          .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

        // Agrupa las citas del rango por día para que se vean las de hoy y las futuras.
        const grupos: Array<{ key: string; label: string; items: Cita[] }> = [];
        for (const cita of empCitas) {
          const key = diaKey(cita.inicio);
          const ultimo = grupos[grupos.length - 1];
          if (ultimo && ultimo.key === key) ultimo.items.push(cita);
          else grupos.push({ key, label: diaLabel(cita.inicio), items: [cita] });
        }

        return (
          <div key={emp.id} className="flex w-[230px] shrink-0 flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-ds-border px-0.5 pb-2.5 pt-1 text-[13px] font-semibold text-ds-fg">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />
              <span className="flex-1 truncate">{emp.nombre}</span>
              <span className="ds-nums rounded-full bg-ds-surface-2 px-2 py-0.5 text-[11px] font-medium text-ds-fg-muted">{empCitas.length}</span>
            </div>

            {grupos.map((grupo) => (
              <div key={grupo.key} className="flex flex-col gap-2">
                <p className="ds-nums mt-1 text-[10px] font-semibold uppercase tracking-wide text-ds-fg-subtle">{grupo.label}</p>
                {grupo.items.map((cita) => {
                  const enCurso = isEnCurso(cita);
                  const realizada = cita.estado === "realizada";
                  const cancelada = cita.estado === "cancelada" || cita.estado === "no_asistio";
                  return (
                    <div
                      key={cita.id}
                      className={`relative flex flex-col gap-0.5 rounded-control border px-3 py-2.5 ${
                        enCurso ? "border-ds-primary bg-ds-primary-tint" : "border-ds-border bg-ds-surface"
                      } ${realizada || cancelada ? "opacity-60" : ""}`}
                    >
                      <span className="ds-nums text-[11px] font-medium text-ds-fg-subtle">{fmtHour(cita.inicio)}</span>
                      <span className="pr-14 text-[13px] font-semibold text-ds-fg">{cita.cliente}</span>
                      <span className="text-[11px] text-ds-fg-muted">{cita.servicio}</span>
                      {enCurso && <span className={`${badge} bg-ds-primary-tint text-ds-primary`}>En curso</span>}
                      {!enCurso && realizada && <span className={`${badge} bg-ds-success-tint text-ds-success`}>Atendido</span>}
                      {!enCurso && !realizada && !cancelada && <span className={`${badge} bg-ds-surface-2 text-ds-fg-muted`}>Próxima</span>}
                      {cancelada && <span className={`${badge} bg-ds-danger-tint text-ds-danger`}>Cancelada</span>}
                    </div>
                  );
                })}
              </div>
            ))}

            {empCitas.length === 0 && (
              <p className="rounded-control border border-dashed border-ds-border px-3 py-4 text-center text-[12px] text-ds-fg-subtle">
                Sin reservas en el rango
              </p>
            )}

            <a
              href={`/admin/agenda?vista=lista&empleadoId=${emp.id}&fecha=${fecha}#nueva-cita`}
              className="mt-1 flex items-center gap-1.5 rounded-control border border-dashed border-ds-border px-3 py-2 text-[12px] font-medium text-ds-fg-subtle transition-colors hover:border-ds-primary hover:text-ds-primary"
            >
              <Plus size={12} /> Agendar
            </a>
          </div>
        );
      })}

      {activeEmpleados.length === 0 && (
        <p className="p-8 text-sm text-ds-fg-subtle">Sin especialistas activos configurados.</p>
      )}
    </div>
  );
}
