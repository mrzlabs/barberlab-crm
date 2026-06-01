import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  activityLogs,
  citas,
  clientes,
  empleados,
  inventario,
  negocios,
  turnos,
  usuarios,
} from "@/lib/db/schema";

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

export async function getNegocioMonthlySummary(negocioId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [row] = await getDb()
    .select({
      turnosCount: sql<number>`count(*)::int`,
      ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
    })
    .from(turnos)
    .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, monthStart)));

  return {
    turnos: row?.turnosCount ?? 0,
    ingresos: Number(row?.ingresos ?? 0),
  };
}

export async function getNegocioUsers(negocioId: string) {
  return getDb().select({
    id: usuarios.id,
    nombre: usuarios.nombre,
    email: usuarios.email,
    rol: usuarios.rol,
    telefono: usuarios.telefono,
    activo: usuarios.activo,
    createdAt: usuarios.createdAt,
  }).from(usuarios).where(eq(usuarios.negocioId, negocioId)).orderBy(desc(usuarios.createdAt)).limit(100);
}

export async function getAllUsuarios(
  opts: { negocioId?: string; rol?: string; q?: string; page?: number; limit?: number } = {},
) {
  const db = getDb();
  const pg = Math.max(1, opts.page ?? 1);
  const lim = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (pg - 1) * lim;

  const conditions = [];
  if (opts.negocioId) conditions.push(eq(usuarios.negocioId, opts.negocioId));
  if (opts.rol)       conditions.push(sql`${usuarios.rol} = ${opts.rol}`);
  if (opts.q?.trim()) {
    const term = `%${opts.q.trim()}%`;
    conditions.push(or(ilike(usuarios.nombre, term), ilike(usuarios.email, term))!);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        rol: usuarios.rol,
        activo: usuarios.activo,
        createdAt: usuarios.createdAt,
        negocioId: usuarios.negocioId,
        negocioNombre: negocios.nombre,
      })
      .from(usuarios)
      .leftJoin(negocios, eq(usuarios.negocioId, negocios.id))
      .where(where)
      .orderBy(desc(usuarios.createdAt))
      .limit(lim)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(usuarios).where(where),
  ]);

  return { rows, total: countRow?.total ?? 0, page: pg, limit: lim, totalPages: Math.ceil((countRow?.total ?? 0) / lim) };
}

export async function getActivityLogs(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const db = getDb();
  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        id: activityLogs.id,
        accion: activityLogs.accion,
        detalle: activityLogs.detalle,
        createdAt: activityLogs.createdAt,
        negocioId: activityLogs.negocioId,
        negocioNombre: negocios.nombre,
        usuarioId: activityLogs.usuarioId,
        usuarioNombre: usuarios.nombre,
        usuarioEmail: usuarios.email,
      })
      .from(activityLogs)
      .leftJoin(negocios, eq(activityLogs.negocioId, negocios.id))
      .leftJoin(usuarios, eq(activityLogs.usuarioId, usuarios.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(activityLogs),
  ]);
  return { rows, total: countRow?.total ?? 0, page, limit };
}

export async function getFacturacion() {
  return getDb()
    .select({
      id: negocios.id,
      nombre: negocios.nombre,
      plan: negocios.plan,
      estado: negocios.estado,
      fechaFin: negocios.fechaFin,
      fechaInicio: negocios.fechaInicio,
    })
    .from(negocios)
    .orderBy(desc(negocios.createdAt))
    .limit(100);
}
