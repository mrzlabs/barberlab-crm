import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { citas, clientes, empleados, servicios, turnos } from "@/lib/db/schema";

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function toStr(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

export async function getEmpleadoByUsr(userId: string) {
  const db = getDb();
  const [empleado] = await db.select().from(empleados).where(eq(empleados.usuarioId, userId)).limit(1);
  if (!empleado) return null;
  return {
    ...empleado,
    createdAt: toStr(empleado.createdAt) as string,
    updatedAt: toStr(empleado.updatedAt) as string,
  };
}

export async function getMiAgenda(userId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return { empleado: null, citas: [], stats: { hoy: 0, pendientes: 0, realizadas: 0 } };

  const db = getDb();
  const { start, end } = dayBounds();

  const [items, stats] = await Promise.all([
    db
      .select({
        id: citas.id,
        inicio: citas.inicio,
        fin: citas.fin,
        estado: citas.estado,
        cliente: clientes.nombre,
        telefono: clientes.telefono,
        servicio: servicios.nombre,
        precio: servicios.precio,
        duracionMin: servicios.duracionMin,
      })
      .from(citas)
      .innerJoin(clientes, eq(citas.clienteId, clientes.id))
      .innerJoin(servicios, eq(citas.servicioId, servicios.id))
      .where(eq(citas.empleadoId, empleado.id))
      .orderBy(desc(citas.inicio))
      .limit(30),
    db
      .select({
        hoy: sql<number>`count(*) filter (where ${citas.inicio} between ${start} and ${end})::int`,
        pendientes: sql<number>`count(*) filter (where ${citas.estado} in ('reservada', 'confirmada'))::int`,
        realizadas: sql<number>`count(*) filter (where ${citas.estado} = 'realizada')::int`,
      })
      .from(citas)
      .where(eq(citas.empleadoId, empleado.id)),
  ]);

  return {
    empleado,
    citas: items.map((item) => ({
      id: item.id,
      estado: item.estado,
      cliente: item.cliente,
      telefono: item.telefono,
      servicio: item.servicio,
      precio: item.precio,
      duracionMin: item.duracionMin,
      inicio: toStr(item.inicio) as string,
      fin: toStr(item.fin) as string,
    })),
    stats: {
      hoy: stats[0]?.hoy ?? 0,
      pendientes: stats[0]?.pendientes ?? 0,
      realizadas: stats[0]?.realizadas ?? 0,
    },
  };
}

export async function getCitasParaCerrar(userId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return [];

  const rows = await getDb()
    .select({
      id: citas.id,
      inicio: citas.inicio,
      estado: citas.estado,
      cliente: clientes.nombre,
      telefono: clientes.telefono,
      servicio: servicios.nombre,
      precio: servicios.precio,
    })
    .from(citas)
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .where(and(eq(citas.empleadoId, empleado.id), sql`${citas.estado} in ('reservada', 'confirmada')`))
    .orderBy(desc(citas.inicio))
    .limit(20);

  return rows.map((r) => ({
    id: r.id,
    estado: r.estado,
    cliente: r.cliente,
    telefono: r.telefono,
    servicio: r.servicio,
    precio: r.precio,
    inicio: toStr(r.inicio) as string,
  }));
}

export async function getMisTurnos(userId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return [];

  const rows = await getDb()
    .select({
      id: turnos.id,
      createdAt: turnos.createdAt,
      precioFinal: turnos.precioFinal,
      propina: turnos.propina,
      metodoPago: turnos.metodoPago,
      cliente: clientes.nombre,
      servicio: servicios.nombre,
    })
    .from(turnos)
    .innerJoin(citas, eq(turnos.citaId, citas.id))
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .where(eq(citas.empleadoId, empleado.id))
    .orderBy(desc(turnos.createdAt))
    .limit(12);

  return rows.map((r) => ({
    id: r.id,
    precioFinal: r.precioFinal,
    propina: r.propina,
    metodoPago: r.metodoPago,
    cliente: r.cliente,
    servicio: r.servicio,
    createdAt: toStr(r.createdAt) as string,
  }));
}

export async function getStatsEmpleado(userId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const db = getDb();
  const comisionPct = Number(empleado.comisionPct);

  const [mesStats, prevMesStats] = await Promise.all([
    db
      .select({
        turnos: sql<number>`count(${turnos.id})::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(eq(citas.empleadoId, empleado.id), gte(turnos.createdAt, monthStart), lte(turnos.createdAt, monthEnd))),
    db
      .select({ ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)` })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(eq(citas.empleadoId, empleado.id), gte(turnos.createdAt, prevMonthStart), lte(turnos.createdAt, prevMonthEnd))),
  ]);

  const ingresosMes = Number(mesStats[0]?.ingresos ?? 0);
  const ingresosPrevMes = Number(prevMesStats[0]?.ingresos ?? 0);
  const delta = ingresosPrevMes > 0
    ? Math.round(((ingresosMes - ingresosPrevMes) / ingresosPrevMes) * 100)
    : null;

  return {
    comisionPct,
    especialidad: empleado.especialidad,
    mes: {
      turnos: mesStats[0]?.turnos ?? 0,
      ingresos: ingresosMes,
      propinas: Number(mesStats[0]?.propinas ?? 0),
      comision: Math.round(ingresosMes * comisionPct / 100),
      ticket: Number(mesStats[0]?.ticket ?? 0),
    },
    delta,
  };
}

export async function citaPerteneceEmpleado(userId: string, citaId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return false;

  const [cita] = await getDb()
    .select({ id: citas.id })
    .from(citas)
    .where(and(eq(citas.id, citaId), eq(citas.empleadoId, empleado.id)))
    .limit(1);

  return Boolean(cita);
}
