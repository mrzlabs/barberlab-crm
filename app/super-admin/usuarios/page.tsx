import { getAllUsuarios, getNegocios } from "@/lib/super-admin/queries";
import { UsuariosManager } from "./UsuariosManager";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function p(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function UsuariosPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(p(searchParams?.page) ?? 1));
  const q     = p(searchParams?.q);
  const negocioId = p(searchParams?.negocio);
  const rol   = p(searchParams?.rol);

  const [{ rows: usuariosRaw, total, totalPages }, negocios] = await Promise.all([
    getAllUsuarios({ q, negocioId, rol, page, limit: 50 }),
    getNegocios(),
  ]);

  const negocioOptions = negocios.map((n) => ({ id: n.id, nombre: n.nombre }));

  const usuarios = usuariosRaw.map((u) => ({
    ...u,
    createdAt: String(u.createdAt),
  }));

  return (
    <div className="space-y-5">
      <PageHeader title="Usuarios globales" description={`${total} usuarios totales en ${negocios.length} comercios.`} />

      <UsuariosManager
        usuarios={usuarios}
        negocios={negocioOptions}
        page={page}
        totalPages={totalPages}
        total={total}
        currentQ={q ?? ""}
        currentNegocio={negocioId ?? ""}
        currentRol={rol ?? ""}
      />
    </div>
  );
}
