import { getEmpleadosAdmin } from "@/lib/admin/catalog";
import { EmpleadoCreateButton, EmpleadoEditButton } from "@/components/admin/EmpleadoModal";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createEmpleado, toggleEmpleado, updateEmpleado } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

function initials(nombre: string) {
  return nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function cop(v: string | number): string {
  return "$" + Number(v).toLocaleString("es-CO");
}

const GRID = "1.8fr 1fr 0.7fr 0.8fr 1fr 0.8fr 1fr auto";

const btnStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
  border: "1px solid #23232f", background: "transparent", color: "#8a8a9c",
  cursor: "pointer",
};

export default async function AdminEmpleadosPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const empleados = await getEmpleadosAdmin(q);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Equipo operativo</p>
          <h2 className="text-2xl font-black">Empleados</h2>
        </div>
        <EmpleadoCreateButton createAction={createEmpleado} />
      </div>

      {/* Search */}
      <form className="flex gap-2" method="get">
        <input
          className="flex-1 rounded-xl crm-input placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
          defaultValue={q ?? ""}
          name="q"
          placeholder="Buscar por nombre…"
          type="search"
        />
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white" type="submit">Buscar</button>
        {q && <a className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-white/8" href="/admin/empleados">Limpiar</a>}
      </form>
      <p className="text-xs text-slate-400">
        {empleados.length} empleado{empleados.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}
      </p>

      {/* Tabla */}
      <div style={{ background: "#13131c", border: "1px solid #23232f", borderRadius: 18, overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: GRID,
          padding: "12px 24px", borderBottom: "1px solid #23232f",
          fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em",
          color: "#6a6a7c", fontWeight: 700, alignItems: "center",
        }}>
          <span>Empleado</span>
          <span>Especialidad</span>
          <span>Comisión</span>
          <span>Turnos mes</span>
          <span>Producción mes</span>
          <span>Estado</span>
          <span>Teléfono</span>
          <span />
        </div>

        {/* Rows */}
        {empleados.map((item, idx) => {
          const turnosMes     = (item as any).turnosMes     ?? 0;
          const produccionMes = (item as any).produccionMes ?? "0";
          const isLast        = idx === empleados.length - 1;

          return (
            <div
              key={item.id}
              className="hover:bg-[#15151f] transition-colors"
              style={{
                display: "grid", gridTemplateColumns: GRID,
                padding: "16px 24px", alignItems: "center",
                borderBottom: isLast ? "none" : "1px solid #1b1b27",
              }}
            >
              {/* Empleado */}
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                  background: "#7F77DD20", color: "#7F77DD",
                }}>
                  {initials(item.nombre)}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#ECECF4" }}>{item.nombre}</div>
                  {item.email && <div style={{ fontSize: 12, color: "#8a8a9c", marginTop: 2 }}>{item.email}</div>}
                </div>
              </div>

              {/* Especialidad */}
              <span style={{ fontSize: 14, color: "#8a8a9c", textTransform: "capitalize" }}>
                {item.especialidad.replace("_", " ")}
              </span>

              {/* Comisión */}
              <span style={{ fontSize: 14, color: "#8a8a9c" }}>{item.comisionPct}%</span>

              {/* Turnos mes */}
              <span style={{ fontSize: 14, color: "#ECECF4", fontWeight: 600 }}>{turnosMes}</span>

              {/* Producción mes */}
              <span style={{ fontSize: 14, color: "#5fb98a", fontWeight: 600 }}>{cop(produccionMes)}</span>

              {/* Estado — toggle */}
              <span>
                <form action={toggleEmpleado} className="inline">
                  <input name="empleadoId" type="hidden" value={item.id} />
                  <input name="usuarioId"  type="hidden" value={item.usuarioId} />
                  <input name="activo"     type="hidden" value={String(!item.activo)} />
                  <SubmitButton
                    label={item.activo ? "Activo" : "Inactivo"}
                    pendingLabel="…"
                    className={item.activo
                      ? "rounded-full px-[10px] py-[3px] text-[11px] font-black cursor-pointer text-[#5fb98a] bg-[#5fb98a15] border border-[#5fb98a30]"
                      : "rounded-full px-[10px] py-[3px] text-[11px] font-black cursor-pointer text-[#8a8a9c] bg-white/[0.06] border border-white/10"
                    }
                  />
                </form>
              </span>

              {/* Teléfono */}
              <span style={{ fontSize: 14, color: "#ECECF4" }}>{item.telefono}</span>

              {/* Editar */}
              <div style={{ display: "flex" }}>
                <EmpleadoEditButton
                  item={{
                    id: item.id, usuarioId: item.usuarioId, nombre: item.nombre,
                    telefono: item.telefono, especialidad: item.especialidad,
                    comisionPct: item.comisionPct, activo: item.activo,
                  }}
                  updateAction={updateEmpleado}
                />
              </div>
            </div>
          );
        })}

        {empleados.length === 0 && (
          <p style={{ padding: "32px", textAlign: "center", fontSize: 14, color: "#8a8a9c" }}>
            Sin empleados registrados.
          </p>
        )}
      </div>
    </div>
  );
}
