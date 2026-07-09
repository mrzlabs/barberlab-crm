import Link from "next/link";
import { getClientesAdmin } from "@/lib/admin/catalog";
import { ClienteCreateButton, ClienteEditButton } from "@/components/admin/ClienteModal";
import { createCliente, updateCliente } from "./actions";

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

const ESTADO_STYLES: Record<string, { avatarBg: string; avatarColor: string; pillBg: string; pillColor: string; pillBorder: string }> = {
  VIP:          { avatarBg: "#F5C40020", avatarColor: "#F5C400", pillBg: "#F5C40015", pillColor: "#F5C400", pillBorder: "#F5C40030" },
  Frecuente:    { avatarBg: "#7F77DD20", avatarColor: "#7F77DD", pillBg: "#7F77DD15", pillColor: "#7F77DD", pillBorder: "#7F77DD30" },
  "En riesgo":  { avatarBg: "#f9731620", avatarColor: "#f97316", pillBg: "#f9731615", pillColor: "#f97316", pillBorder: "#f9731630" },
  Nuevo:        { avatarBg: "#27C3D820", avatarColor: "#27C3D8", pillBg: "#27C3D815", pillColor: "#27C3D8", pillBorder: "#27C3D830" },
};

const GRID = "1.8fr 1.2fr 0.8fr 0.8fr 1fr 1.2fr 156px";

const btnStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
  border: "1px solid #23232f", background: "transparent", color: "#8a8a9c",
  cursor: "pointer", textDecoration: "none", display: "inline-block",
};

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const clientes = await getClientesAdmin(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">CRM clientes</p>
          <h2 className="text-2xl font-black">Clientes</h2>
        </div>
        <ClienteCreateButton createAction={createCliente} />
      </div>

      <form className="flex gap-2" method="get">
        <input
          className="flex-1 rounded-xl crm-input placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
          defaultValue={q ?? ""}
          name="q"
          placeholder="Buscar por nombre o teléfono…"
          type="search"
        />
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white" type="submit">Buscar</button>
        {q && <a className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-white/8" href="/admin/clientes">Limpiar</a>}
      </form>
      <p className="text-xs text-slate-400">
        {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}
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
          <span>Cliente</span>
          <span style={{ textAlign: "center" }}>Última visita</span>
          <span style={{ textAlign: "center" }}>Visitas</span>
          <span style={{ textAlign: "center" }}>Puntos</span>
          <span style={{ textAlign: "center" }}>Estado</span>
          <span style={{ textAlign: "center" }}>Teléfono</span>
          <span />
        </div>

        {/* Rows */}
        {clientes.map((item, idx) => {
          const total     = (item as any).totalVisitas     ?? 0;
          const recientes = (item as any).visitasRecientes ?? 0;
          const ultima    = (item as any).ultimaVisita     ?? null;
          const estado    = (item as any).estadoCrm        ?? computeEstado(total, recientes, ultima);
          const st        = ESTADO_STYLES[estado] ?? ESTADO_STYLES.Nuevo;
          const isLast    = idx === clientes.length - 1;

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
              {/* Cliente */}
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0, overflow: "hidden" }}>
                <span style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                  background: st.avatarBg, color: st.avatarColor,
                }}>
                  {initials(item.nombre)}
                </span>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#ECECF4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</div>
                  {item.email && <div style={{ fontSize: 12, color: "#8a8a9c", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.email}</div>}
                </div>
              </div>

              {/* Última visita */}
              <span style={{ fontSize: 14, color: "#8a8a9c", textAlign: "center", display: "block" }}>{relativeTime(ultima)}</span>

              {/* Visitas */}
              <span style={{ fontSize: 14, color: "#8a8a9c", textAlign: "center", display: "block" }}>{total}</span>

              {/* Puntos */}
              <span style={{ fontSize: 13, fontWeight: 800, color: "#F5C400", textAlign: "center", display: "block" }}>
                {((item as any).puntos ?? 0).toLocaleString("es-CO")}
              </span>

              {/* Estado */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
                  background: st.pillBg, color: st.pillColor, border: `1px solid ${st.pillBorder}`,
                }}>
                  {estado}
                </span>
              </div>

              {/* Teléfono */}
              <span style={{ fontSize: 14, color: "#ECECF4", textAlign: "center", display: "block" }}>{item.telefono}</span>

              {/* Acciones */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link href={`/admin/clientes/${item.id}`} style={btnStyle}>
                  Historial
                </Link>
                <ClienteEditButton
                  item={{ id: item.id, nombre: item.nombre, telefono: item.telefono, email: item.email, notas: item.notas }}
                  updateAction={updateCliente}
                />
              </div>
            </div>
          );
        })}

        {clientes.length === 0 && (
          <p style={{ padding: "32px", textAlign: "center", fontSize: 14, color: "#8a8a9c" }}>
            Sin clientes registrados.
          </p>
        )}
      </div>
    </div>
  );
}