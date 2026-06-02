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
import { serializeDates } from "@/lib/utils";

export async function getNegocios() {
  const rows = await getDb()
    .select({
      id: negocios.id,
      nombre: negocios.nombre,
      slug: negocios.slug,
      telefono: negocios.telefono,
      correo: negocios.correo,
      direccion: negocios.direccion,
      representante: negocios.representante,
      tipoDocumento: negocios.tipoDocumento,
      numeroDocumento: negocios.numeroDocumento,
      ciudadIndicativo: negocios.ciudadIndicativo,
      contactoPrincipal: negocios.contactoPrincipal,
      descripcion: negocios.descripcion,
      slogan: negocios.slogan,
      logoUrl: negocios.logoUrl,
      colorPrimario: negocios.colorPrimario,
      colorSecundario: negocios.colorSecundario,
      colorAcento: negocios.colorAcento,
      fuente: negocios.fuente,
      configVisual: negocios.configVisual,
      plan: negocios.plan,
      estado: negocios.estado,
      modoAislamiento: negocios.modoAislamiento,
      comisionBase: negocios.comisionBase,
      propinaEnComision: negocios.propinaEnComision,
      fechaInicio: negocios.fechaInicio,
      fechaFin: negocios.fechaFin,
      createdAt: negocios.createdAt,
      updatedAt: negocios.updatedAt,
      adminEmail: sql<string | null>`(SELECT email FROM usuarios WHERE negocio_id = ${negocios.id} AND rol = 'admin' AND activo = true ORDER BY created_at ASC LIMIT 1)`,
    })
    .from(negocios)
    .orderBy(desc(negocios.createdAt))
    .limit(100);
  return serializeDates(rows);
}

export async function getNegocioById(id: string) {
  const [negocio] = await getDb().select().from(negocios).where(eq(negocios.id, id)).limit(1);
  return negocio ? serializeDates(negocio) : undefined;
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
  const monthStartDate = new Date();
  monthStartDate.setDate(1);
  monthStartDate.setHours(0, 0, 0, 0);
  const monthStart = monthStartDate.toISOString();

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
  const rows = await getDb().select({
    id: usuarios.id,
    nombre: usuarios.nombre,
    email: usuarios.email,
    rol: usuarios.rol,
    telefono: usuarios.telefono,
    activo: usuarios.activo,
    createdAt: usuarios.createdAt,
  }).from(usuarios).where(eq(usuarios.negocioId, negocioId)).orderBy(desc(usuarios.createdAt)).limit(100);
  return serializeDates(rows);
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
        lastSignIn: sql<string | null>`(SELECT last_sign_in_at::text FROM auth.users WHERE id = ${usuarios.id})`,
      })
      .from(usuarios)
      .leftJoin(negocios, eq(usuarios.negocioId, negocios.id))
      .where(where)
      .orderBy(desc(usuarios.createdAt))
      .limit(lim)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(usuarios).where(where),
  ]);

  return serializeDates({ rows, total: countRow?.total ?? 0, page: pg, limit: lim, totalPages: Math.ceil((countRow?.total ?? 0) / lim) });
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
  return serializeDates({ rows, total: countRow?.total ?? 0, page, limit });
}

export async function getRenewalRequests(limit = 8) {
  const rows = await getDb()
    .select({
      id: activityLogs.id,
      createdAt: activityLogs.createdAt,
      detalle: activityLogs.detalle,
      negocioId: activityLogs.negocioId,
      negocioNombre: negocios.nombre,
      usuarioNombre: usuarios.nombre,
      usuarioEmail: usuarios.email,
    })
    .from(activityLogs)
    .leftJoin(negocios, eq(activityLogs.negocioId, negocios.id))
    .leftJoin(usuarios, eq(activityLogs.usuarioId, usuarios.id))
    .where(eq(activityLogs.accion, "suscripcion_renovacion_solicitada"))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);

  return serializeDates(rows);
}

export type PlanPermiso = { feature: string; habilitado: boolean; detalle: string };

export function getPlanPermisos(plan: string): PlanPermiso[] {
  const permisos: Record<string, PlanPermiso[]> = {
    starter: [
      { feature: "Empleados",          habilitado: true,  detalle: "Máximo 3 empleados activos" },
      { feature: "Reportes básicos",   habilitado: true,  detalle: "KPIs esenciales y tendencia diaria" },
      { feature: "Agenda",             habilitado: true,  detalle: "Citas y turnos ilimitados" },
      { feature: "Inventario",         habilitado: true,  detalle: "Gestión básica de stock" },
      { feature: "Inventario avanzado",habilitado: false, detalle: "No incluye categorías ni movimientos avanzados" },
      { feature: "Configuración visual",habilitado: false, detalle: "Branding limitado al plan Pro+" },
      { feature: "Multi-sucursal",     habilitado: false, detalle: "Solo disponible en Enterprise" },
      { feature: "API access",         habilitado: false, detalle: "No disponible en Starter" },
    ],
    pro: [
      { feature: "Empleados",          habilitado: true,  detalle: "Máximo 10 empleados activos" },
      { feature: "Reportes completos", habilitado: true,  detalle: "KPIs, DnD modules, exportar CSV" },
      { feature: "Agenda",             habilitado: true,  detalle: "Citas y turnos ilimitados" },
      { feature: "Inventario",         habilitado: true,  detalle: "Gestión completa con categorías y movimientos" },
      { feature: "Inventario avanzado",habilitado: true,  detalle: "Categorías, costos y movimientos avanzados" },
      { feature: "Configuración visual",habilitado: true, detalle: "Colores, fuente, logo y foto de fondo" },
      { feature: "Multi-sucursal",     habilitado: false, detalle: "Solo disponible en Enterprise" },
      { feature: "API access",         habilitado: false, detalle: "No disponible en Pro" },
    ],
    enterprise: [
      { feature: "Empleados",          habilitado: true,  detalle: "Sin límite de empleados" },
      { feature: "Reportes completos", habilitado: true,  detalle: "Todos los reportes + exportación avanzada" },
      { feature: "Agenda",             habilitado: true,  detalle: "Citas y turnos ilimitados" },
      { feature: "Inventario",         habilitado: true,  detalle: "Gestión completa sin restricciones" },
      { feature: "Inventario avanzado",habilitado: true,  detalle: "Categorías, costos, alertas y movimientos" },
      { feature: "Configuración visual",habilitado: true, detalle: "Branding completo y modo dedicado" },
      { feature: "Multi-sucursal",     habilitado: true,  detalle: "Múltiples sucursales con negocio_id compartido" },
      { feature: "API access",         habilitado: true,  detalle: "API REST con token de acceso" },
      { feature: "Soporte prioritario",habilitado: true,  detalle: "Canal dedicado de soporte y SLA garantizado" },
    ],
  };
  return permisos[plan] ?? permisos.starter;
}

export async function getFacturacion() {
  const rows = await getDb()
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
  return serializeDates(rows);
}
