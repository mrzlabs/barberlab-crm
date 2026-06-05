"use client";

import { Plus } from "lucide-react";

const PALETTE = ["#27C3D8", "#7F77DD", "#F5C400", "#B57BE0", "#5A82EE", "#5fb98a"];

type Cita = {
  id: string;
  inicio: Date | string;
  fin: Date | string;
  estado: string;
  empleadoId: string;
  cliente: string;
  servicio: string;
};

type Empleado = {
  id: string;
  nombre: string;
  activo: boolean;
};

type Props = {
  citas: Cita[];
  empleados: Empleado[];
  fecha: string;
};

function fmtHour(date: Date | string): string {
  return new Date(date).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function AgendaBoardView({ citas, empleados, fecha }: Props) {
  const now = new Date();
  const activeEmpleados = empleados.filter((e) => e.activo);

  const fechaRef = new Date(`${fecha}T12:00:00`).toDateString();
  const citasDia = citas.filter(
    (c) => new Date(c.inicio).toDateString() === fechaRef,
  );

  function isEnCurso(c: Cita): boolean {
    return now >= new Date(c.inicio) && now <= new Date(c.fin);
  }

  return (
    <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
      {activeEmpleados.map((emp, colIdx) => {
        const color = PALETTE[colIdx % PALETTE.length];
        const empCitas = citasDia
          .filter((c) => c.empleadoId === emp.id)
          .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

        type Item =
          | { type: "cita"; cita: Cita; key: string }
          | { type: "gap"; key: string };

        const items: Item[] = [];
        for (let i = 0; i < empCitas.length; i++) {
          if (i > 0) {
            const gapMs =
              new Date(empCitas[i].inicio).getTime() -
              new Date(empCitas[i - 1].fin).getTime();
            if (gapMs > 30 * 60 * 1000) {
              items.push({ type: "gap", key: `gap-${i}` });
            }
          }
          items.push({ type: "cita", cita: empCitas[i], key: empCitas[i].id });
        }
        items.push({ type: "gap", key: "gap-end" });

        return (
          <div
            key={emp.id}
            style={{ flexShrink: 0, width: 220, display: "flex", flexDirection: "column", gap: 8 }}
          >
            {/* Column header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13.5, fontWeight: 700, padding: "4px 2px 10px",
              borderBottom: "1px solid rgba(255,255,255,.06)", color: "#ECECF4",
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: color, flexShrink: 0,
              }} />
              <span style={{ flex: 1 }}>{emp.nombre}</span>
              <span style={{
                fontSize: 10.5, fontWeight: 800,
                background: "rgba(255,255,255,.07)", borderRadius: 999,
                padding: "2px 8px", color: "rgba(255,255,255,.5)",
              }}>
                {empCitas.length}
              </span>
            </div>

            {/* Items */}
            {items.map((item) => {
              if (item.type === "gap") {
                return (
                  <a
                    key={item.key}
                    href={`/admin/agenda?vista=lista&empleadoId=${emp.id}&fecha=${fecha}#nueva-cita`}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      border: "1.5px dashed rgba(255,255,255,.10)", borderRadius: 13,
                      padding: "9px 13px", fontSize: 12, fontWeight: 700,
                      color: "rgba(255,255,255,.28)", background: "transparent",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = color + "70";
                      e.currentTarget.style.color = color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,.10)";
                      e.currentTarget.style.color = "rgba(255,255,255,.28)";
                    }}
                  >
                    <Plus size={12} /> Agendar
                  </a>
                );
              }

              const { cita } = item;
              const enCurso  = isEnCurso(cita);
              const realizada = cita.estado === "realizada";
              const cancelada = cita.estado === "cancelada" || cita.estado === "no_asistio";

              return (
                <div
                  key={item.key}
                  style={{
                    position: "relative", borderRadius: 13, padding: "11px 13px",
                    display: "flex", flexDirection: "column", gap: 3,
                    border: enCurso ? "1px solid #27C3D8" : "1px solid rgba(255,255,255,.07)",
                    background: enCurso ? "rgba(39,195,216,.06)" : "rgba(255,255,255,.04)",
                    boxShadow: enCurso ? "0 0 0 1px #27C3D8, 0 0 22px -8px #27C3D8" : "none",
                    opacity: (realizada || cancelada) ? 0.58 : 1,
                  }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,.38)" }}>
                    {fmtHour(cita.inicio)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)", paddingRight: 52 }}>
                    {cita.cliente}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>
                    {cita.servicio}
                  </span>

                  {enCurso && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                      background: "#06303a", color: "#27C3D8", whiteSpace: "nowrap",
                    }}>En curso</span>
                  )}
                  {!enCurso && realizada && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                      background: "#1f2a22", color: "#5fb98a", whiteSpace: "nowrap",
                    }}>Atendido</span>
                  )}
                  {!enCurso && !realizada && !cancelada && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                      background: "#241f47", color: "#a79df0", whiteSpace: "nowrap",
                    }}>Próxima</span>
                  )}
                  {cancelada && (
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                      background: "#3a0f0f", color: "#f87171", whiteSpace: "nowrap",
                    }}>Cancelada</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {activeEmpleados.length === 0 && (
        <p style={{ fontSize: 14, color: "#8a8a9c", padding: 32 }}>
          Sin especialistas activos configurados.
        </p>
      )}
    </div>
  );
}
