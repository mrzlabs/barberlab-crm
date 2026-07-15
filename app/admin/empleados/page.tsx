import Link from "next/link";
import { Search, Users } from "lucide-react";
import { getEmpleadosAdmin } from "@/lib/admin/catalog";
import { EmpleadoCreateButton, EmpleadoEditButton } from "@/components/admin/EmpleadoModal";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createEmpleado, toggleEmpleado, updateEmpleado } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

function initials(nombre: string) {
  return nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function cop(v: string | number): string {
  return "$" + Number(v).toLocaleString("es-CO");
}

export default async function AdminEmpleadosPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const empleados = await getEmpleadosAdmin(q);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Empleados"
        description="Equipo, especialidad, comisión y producción del mes."
        actions={<EmpleadoCreateButton createAction={createEmpleado} />}
      />

      <form className="flex gap-2" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-fg-subtle" />
          <Input className="pl-9" defaultValue={q ?? ""} name="q" placeholder="Buscar por nombre…" type="search" />
        </div>
        <button className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">
          Buscar
        </button>
        {q && (
          <Link className="inline-flex h-control items-center rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg-muted hover:bg-ds-surface-2" href="/admin/empleados">
            Limpiar
          </Link>
        )}
      </form>

      <p className="text-[13px] text-ds-fg-muted">
        {empleados.length} empleado{empleados.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}
      </p>

      {empleados.length === 0 ? (
        <EmptyState icon={Users} title="Sin empleados registrados" description={q ? "Prueba con otra búsqueda." : "Crea el primer empleado del equipo."} />
      ) : (
        <div className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-ds-border text-[12px] uppercase tracking-wide text-ds-fg-muted">
                  <th className="px-5 py-2.5 font-medium">Empleado</th>
                  <th className="px-5 py-2.5 text-center font-medium">Especialidad</th>
                  <th className="px-5 py-2.5 text-center font-medium">Comisión</th>
                  <th className="px-5 py-2.5 text-center font-medium">Turnos mes</th>
                  <th className="px-5 py-2.5 text-center font-medium">Producción mes</th>
                  <th className="px-5 py-2.5 text-center font-medium">Estado</th>
                  <th className="px-5 py-2.5 text-center font-medium">Teléfono</th>
                  <th className="px-5 py-2.5 text-right font-medium">Editar</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((item) => {
                  const turnosMes     = (item as any).turnosMes     ?? 0;
                  const produccionMes = (item as any).produccionMes ?? "0";
                  return (
                    <tr className="border-b border-ds-border last:border-0 hover:bg-ds-surface-2" key={item.id}>
                      <td className="px-5 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ds-surface-2 text-[12px] font-semibold text-ds-fg-muted">
                            {initials(item.nombre)}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-ds-fg">{item.nombre}</div>
                            {item.email && <div className="truncate text-[12px] text-ds-fg-muted">{item.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center capitalize text-ds-fg-muted">{item.especialidad.replace("_", " ")}</td>
                      <td className="ds-nums px-5 py-3 text-center text-ds-fg-muted">{item.comisionPct}%</td>
                      <td className="ds-nums px-5 py-3 text-center font-medium text-ds-fg">{turnosMes}</td>
                      <td className="ds-nums px-5 py-3 text-center font-medium text-ds-success">{cop(produccionMes)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center">
                          <form action={toggleEmpleado} className="inline">
                            <input name="empleadoId" type="hidden" value={item.id} />
                            <input name="usuarioId" type="hidden" value={item.usuarioId} />
                            <input name="activo" type="hidden" value={String(!item.activo)} />
                            <SubmitButton
                              label={item.activo ? "Activo" : "Inactivo"}
                              pendingLabel="…"
                              className={item.activo
                                ? "cursor-pointer rounded-full border border-ds-success/30 bg-ds-success-tint px-2.5 py-0.5 text-[11px] font-medium text-ds-success"
                                : "cursor-pointer rounded-full border border-ds-border bg-ds-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-ds-fg-muted"
                              }
                            />
                          </form>
                        </div>
                      </td>
                      <td className="ds-nums px-5 py-3 text-center text-ds-fg">{item.telefono}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <EmpleadoEditButton
                            item={{
                              id: item.id, usuarioId: item.usuarioId, nombre: item.nombre,
                              telefono: item.telefono, especialidad: item.especialidad,
                              comisionPct: item.comisionPct, activo: item.activo,
                            }}
                            updateAction={updateEmpleado}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
