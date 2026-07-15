import Link from "next/link";
import { Search, Users } from "lucide-react";
import { getClientesAdmin } from "@/lib/admin/catalog";
import { ClienteCreateButton, ClienteEditButton } from "@/components/admin/ClienteModal";
import { createCliente, updateCliente } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

function initials(nombre: string) {
  return nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return "Sin visitas";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7)  return `Hace ${days} días`;
  if (days < 14) return "Hace 1 sem";
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`;
  if (days < 60) return "Hace 1 mes";
  return `Hace ${Math.floor(days / 30)} meses`;
}

function computeEstado(total: number, recientes: number, ultima: string | null | undefined): string {
  if (total >= 6) return "VIP";
  const d = ultima ? Math.floor((Date.now() - new Date(ultima).getTime()) / 86400000) : 999;
  if (d > 45) return "En riesgo";
  if (recientes >= 2) return "Frecuente";
  return "Nuevo";
}

const ESTADO_TONE: Record<string, "neutral" | "primary" | "success" | "warning" | "danger"> = {
  VIP: "warning",
  Frecuente: "primary",
  "En riesgo": "danger",
  Nuevo: "neutral",
};

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const clientes = await getClientesAdmin(q);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clientes"
        description="Historial, visitas y puntos de cada cliente."
        actions={<ClienteCreateButton createAction={createCliente} />}
      />

      <form className="flex gap-2" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-fg-subtle" />
          <Input className="pl-9" defaultValue={q ?? ""} name="q" placeholder="Buscar por nombre o teléfono…" type="search" />
        </div>
        <button className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">
          Buscar
        </button>
        {q && (
          <Link className="inline-flex h-control items-center rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg-muted hover:bg-ds-surface-2" href="/admin/clientes">
            Limpiar
          </Link>
        )}
      </form>

      <p className="text-[13px] text-ds-fg-muted">
        {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}
      </p>

      {clientes.length === 0 ? (
        <EmptyState icon={Users} title="Sin clientes registrados" description={q ? "Prueba con otra búsqueda." : "Crea el primer cliente para empezar."} />
      ) : (
        <div className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ds-border text-[12px] uppercase tracking-wide text-ds-fg-muted">
                  <th className="px-5 py-2.5 font-medium">Cliente</th>
                  <th className="px-5 py-2.5 text-center font-medium">Última visita</th>
                  <th className="px-5 py-2.5 text-center font-medium">Visitas</th>
                  <th className="px-5 py-2.5 text-center font-medium">Puntos</th>
                  <th className="px-5 py-2.5 text-center font-medium">Estado</th>
                  <th className="px-5 py-2.5 text-center font-medium">Teléfono</th>
                  <th className="px-5 py-2.5 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((item) => {
                  const total     = (item as any).totalVisitas     ?? 0;
                  const recientes = (item as any).visitasRecientes ?? 0;
                  const ultima    = (item as any).ultimaVisita     ?? null;
                  const estado    = (item as any).estadoCrm        ?? computeEstado(total, recientes, ultima);
                  const puntos    = (item as any).puntos ?? 0;

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
                      <td className="px-5 py-3 text-center text-ds-fg-muted">{relativeTime(ultima)}</td>
                      <td className="ds-nums px-5 py-3 text-center text-ds-fg-muted">{total}</td>
                      <td className="ds-nums px-5 py-3 text-center font-medium text-ds-fg">{puntos.toLocaleString("es-CO")}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge tone={ESTADO_TONE[estado] ?? "neutral"}>{estado}</Badge>
                      </td>
                      <td className="ds-nums px-5 py-3 text-center text-ds-fg">{item.telefono}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/clientes/${item.id}`}
                            className="rounded-control border border-ds-border px-2.5 py-1 text-[12px] font-medium text-ds-fg-muted transition-colors hover:border-ds-border-strong hover:text-ds-fg"
                          >
                            Historial
                          </Link>
                          <ClienteEditButton
                            item={{ id: item.id, nombre: item.nombre, telefono: item.telefono, email: item.email, notas: item.notas }}
                            updateAction={updateCliente}
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
