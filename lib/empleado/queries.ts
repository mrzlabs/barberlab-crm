import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { citas, clientes, empleados, servicios, turnos } from "@/lib/db/schema";
import { serializeDates } from "@/lib/utils";

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getEmpleadoByUsr(userId: string) {
  const db = getDb();
  const [row] = await db.select().from(empleados).where(eq(empleados.usuarioId, userId)).limit(1);
  return row ? serializeDates(row) : null;
}

export async function getMiAgenda(userId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return serializeDates({ empleado: null, citas: [], stats: { hoy: 0, pendientes: 0, realizadas: 0 } });

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

  return serializeDates({
    empleado,
    citas: items,
    stats: {
      hoy: stats[0]?.hoy ?? 0,
      pendientes: stats[0]?.pendientes ?? 0,
      realizadas: stats[0]?.realizadas ?? 0,
    },
  });
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

  return serializeDates(rows);
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

  return serializeDates(rows);
}

export async function getStatsEmpleado(userId: string) {
  const empleado = await getEmpleadoByUsr(userId);
  if (!empleado) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

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

  return serializeDates({
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
  });
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

export async function getReportesEmpleado(empleadoId: string, desde: string, hasta: string) {
  const from = new Date(`${desde}T00:00:00-05:00`).toISOString();
  const to = new Date(`${hasta}T23:59:59-05:00`).toISOString();
  const db = getDb();

  const [empleado] = await db
    .select({ comisionPct: empleados.comisionPct })
    .from(empleados)
    .where(eq(empleados.id, empleadoId))
    .limit(1);

  const comisionPct = Number(empleado?.comisionPct ?? 0);

  const rows = await db
    .select({
      id: turnos.id,
      fecha: turnos.createdAt,
      cliente: clientes.nombre,
      servicio: servicios.nombre,
      precioFinal: turnos.precioFinal,
      propina: turnos.propina,
    })
    .from(turnos)
    .innerJoin(citas, eq(turnos.citaId, citas.id))
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .where(and(eq(citas.empleadoId, empleadoId), gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
    .orderBy(desc(turnos.createdAt));

  const serviciosRealizados = rows.map((row) => {
    const ingreso = Number(row.precioFinal ?? 0) + Number(row.propina ?? 0);
    return {
      id: row.id,
      fecha: row.fecha,
      cliente: row.cliente,
      servicio: row.servicio,
      ingreso,
      comision: Math.round((ingreso * comisionPct) / 100),
    };
  });

  const ingresos = serviciosRealizados.reduce((acc, row) => acc + row.ingreso, 0);
  const comisiones = serviciosRealizados.reduce((acc, row) => acc + row.comision, 0);
  const serviciosCount = serviciosRealizados.length;

  return serializeDates({
    comisionPct,
    kpis: {
      servicios: serviciosCount,
      ingresos,
      comisiones,
      ticket: serviciosCount ? Math.round(ingresos / serviciosCount) : 0,
    },
    servicios: serviciosRealizados,
  });
}
