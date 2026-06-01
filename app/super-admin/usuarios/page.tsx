import { getAllUsuarios, getNegocios } from "@/lib/super-admin/queries";
import { UsuariosManager } from "./UsuariosManager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const [usuarios, negocios] = await Promise.all([
    getAllUsuarios(),
    getNegocios(),
  ]);

  const negocioOptions = negocios.map((n) => ({ id: n.id, nombre: n.nombre }));

  // Serialize Date → string before crossing the Server→Client Component boundary
  const usuariosSerial = usuarios.map((u) => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
  }));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.28),transparent_16rem),radial-gradient(circle_at_85%_70%,rgba(168,85,247,.28),transparent_18rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:mt-8">MRZLABS · Directorio</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Usuarios globales</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            {usuariosSerial.length} usuarios registrados en {negocios.length} comercios. Haz clic en cualquier fila para ver detalle.
          </p>
        </div>
      </section>

      <UsuariosManager usuarios={usuariosSerial} negocios={negocioOptions} />
    </div>
  );
}
