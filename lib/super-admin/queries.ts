import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { citas, clientes, empleados, inventario, negocios, turnos } from "@/lib/db/schema";

export async function getNegocios() {
  return getDb().select().from(negocios).orderBy(desc(negocios.createdAt)).limit(100);
}

export async function getNegocioById(id: string) {
  const [negocio] = await getDb().select().from(negocios).where(eq(negocios.id, id)).limit(1);
  return negocio;
}

export async function getNegocioStats(negocioId: string) {
  const [[empleadosRow], [clientesRow], [citasRow], [turnosRow], [inventarioRow]] = await Promise.all([
    getDb().select({ total: count() }).from(empleados).where(eq(empleados.negocioId, negocioId)),
    getDb().select({ total: count() }).from(clientes).where(eq(clientes.negocioId, negocioId)),
    getDb().select({ total: count() }).from(citas).where(eq(citas.negocioId, negocioId)),
    getDb().select({ total: count() }).from(turnos).where(eq(turnos.negocioId, negocioId)),
    getDb().select({ total: count() }).from(inventario).where(eq(inventario.negocioId, negocioId)),
  ]);

  return {
    empleados: empleadosRow?.total ?? 0,
    clientes: clientesRow?.total ?? 0,
    citas: citasRow?.total ?? 0,
    turnos: turnosRow?.total ?? 0,
    inventario: inventarioRow?.total ?? 0,
  };
}
