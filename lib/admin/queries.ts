import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { mockCitas, mockGastos, mockInventario, mockTurnos } from "@/lib/mock";
import {
  citas,
  clientes,
  empleados,
  gastos,
  inventario,
  servicioInsumos,
  servicios,
  turnos,
  usuarios,
} from "@/lib/db/schema";
import { toDateInput } from "@/lib/admin/format";
import { serializeDates } from "@/lib/utils";

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboard(negocioId: string) {
  if (isDemoMode()) {
    return {
      today: { turnos: 18, citas: 24, ingresos: 2450000, gastos: 420000, costoInsumo: 180000, margen: 1850000, propinas: 85000, ticket: 72000 },
      month: { turnos: 286, ingresos: 36500000, gastos: 9400000, costoInsumo: 4200000, margen: 22900000, ticket: 76500 },
      lowStock: 1,
      deltaHoy: { ingresos: 8, margen: 5, ticket: -3 },
      deltaMes: { ingresos: 12, margen: 15 },
    };
  }

  const db = getDb();
  const now = new Date();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = startOfMonth();
  const today = toDateInput();

  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const costByTurn = sql<string>`(
    select coalesce(sum(si.cantidad * i.costo_unitario), 0)
    from ${servicioInsumos} si
    inner join ${inventario} i on i.id = si.inventario_id
    where si.servicio_id = ${citas.servicioId}
  )`;

  const [todayTurnos, monthTurnos, todayGastos, monthGastos, lowStock, todayCitas, yesterdayTurnos, lastMonthTurnos] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, todayStart), lte(turnos.createdAt, todayEnd))),
    db
      .select({
        count: sql<number>`count(*)::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, monthStart))),
    db
      .select({ total: sql<string>`coalesce(sum(${gastos.monto}), 0)` })
      .from(gastos)
      .where(and(eq(gastos.negocioId, negocioId), eq(gastos.fecha, today))),
    db
      .select({ total: sql<string>`coalesce(sum(${gastos.monto}), 0)` })
      .from(gastos)
      .where(and(eq(gastos.negocioId, negocioId), gte(gastos.fecha, toDateInput(monthStart)))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventario)
      .where(and(eq(inventario.negocioId, negocioId), eq(inventario.activo, true), sql`${inventario.stock} <= ${inventario.stockMinimo}`)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(citas)
      .where(and(eq(citas.negocioId, negocioId), gte(citas.inicio, todayStart), lte(citas.inicio, todayEnd))),
    // Ayer (para delta hoy)
    db
      .select({
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, yesterdayStart), lte(turnos.createdAt, yesterdayEnd))),
    // Mes anterior (para delta mes)
    db
      .select({
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, lastMonthStart), lte(turnos.createdAt, lastMonthEnd))),
  ]);

  const todayIncome = Number(todayTurnos[0]?.ingresos ?? 0);
  const todayExpense = Number(todayGastos[0]?.total ?? 0);
  const todayCostoInsumo = Number(todayTurnos[0]?.costoInsumo ?? 0);
  const todayMargen = todayIncome - todayExpense - todayCostoInsumo;
  const todayTicket = Number(todayTurnos[0]?.ticket ?? 0);
  const monthIncome = Number(monthTurnos[0]?.ingresos ?? 0);
  const monthExpense = Number(monthGastos[0]?.total ?? 0);
  const monthCostoInsumo = Number(monthTurnos[0]?.costoInsumo ?? 0);

  const yIncome = Number(yesterdayTurnos[0]?.ingresos ?? 0);
  const yCostoInsumo = Number(yesterdayTurnos[0]?.costoInsumo ?? 0);
  const yMargen = yIncome - yCostoInsumo;
  const yTicket = Number(yesterdayTurnos[0]?.ticket ?? 0);

  const lmIncome = Number(lastMonthTurnos[0]?.ingresos ?? 0);
  const lmCostoInsumo = Number(lastMonthTurnos[0]?.costoInsumo ?? 0);
  const lmMargen = lmIncome - lmCostoInsumo;

  return {
    today: {
      turnos: todayTurnos[0]?.count ?? 0,
      citas: todayCitas[0]?.count ?? 0,
      ingresos: todayIncome,
      gastos: todayExpense,
      costoInsumo: todayCostoInsumo,
      margen: todayMargen,
      propinas: Number(todayTurnos[0]?.propinas ?? 0),
      ticket: todayTicket,
    },
    month: {
      turnos: monthTurnos[0]?.count ?? 0,
      ingresos: monthIncome,
      gastos: monthExpense,
      costoInsumo: monthCostoInsumo,
      margen: monthIncome - monthExpense - monthCostoInsumo,
      ticket: Number(monthTurnos[0]?.ticket ?? 0),
    },
    lowStock: lowStock[0]?.count ?? 0,
    deltaHoy: {
      ingresos: calcDelta(todayIncome, yIncome),
      margen: calcDelta(todayMargen, yMargen),
      ticket: calcDelta(todayTicket, yTicket),
    },
    deltaMes: {
      ingresos: calcDelta(monthIncome, lmIncome),
      margen: calcDelta(monthIncome - monthExpense - monthCostoInsumo, lmMargen),
    },
  };
}

export async function getRecentTurnos(negocioId: string) {
  if (isDemoMode()) return mockTurnos;

  const rows = await getDb()
    .select({
      id: turnos.id,
      createdAt: turnos.createdAt,
      precioFinal: turnos.precioFinal,
      propina: turnos.propina,
      metodoPago: turnos.metodoPago,
      cliente: clientes.nombre,
      servicio: servicios.nombre,
      empleado: usuarios.nombre,
    })
    .from(turnos)
    .innerJoin(citas, eq(turnos.citaId, citas.id))
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(eq(turnos.negocioId, negocioId))
    .orderBy(desc(turnos.createdAt))
    .limit(12);
  return serializeDates(rows);
}

export async function getPendingCitas(negocioId: string) {
  if (isDemoMode()) return mockCitas;

  const rows = await getDb()
    .select({
      id: citas.id,
      inicio: citas.inicio,
      estado: citas.estado,
      cliente: clientes.nombre,
      servicio: servicios.nombre,
      precio: servicios.precio,
      empleado: usuarios.nombre,
    })
    .from(citas)
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .leftJoin(turnos, eq(turnos.citaId, citas.id))
    .where(and(
      eq(citas.negocioId, negocioId),
      sql`${citas.estado} in ('confirmada', 'realizada')`,
      isNull(turnos.id),
    ))
    .orderBy(desc(citas.inicio))
    .limit(20);
  return serializeDates(rows);
}

export async function getGastos(negocioId: string, categoria?: string) {
  if (isDemoMode()) return mockGastos;

  const db = getDb();
  const conditions = [eq(gastos.negocioId, negocioId)];
  if (categoria?.trim()) {
    conditions.push(sql`${gastos.categoria} = ${categoria.trim()}`);
  }
  return serializeDates(await db.select().from(gastos).where(and(...conditions)).orderBy(desc(gastos.fecha), desc(gastos.createdAt)).limit(40));
}

export async function getInventario(negocioId: string, search?: string, soloAlertas?: boolean) {
  if (isDemoMode()) return mockInventario;

  const db = getDb();
  const conditions = [eq(inventario.negocioId, negocioId)];
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(or(ilike(inventario.nombre, term), ilike(inventario.sku, term))!);
  }
  if (soloAlertas) {
    conditions.push(sql`${inventario.stockMinimo} > 0`);
    conditions.push(sql`${inventario.stock} <= ${inventario.stockMinimo}`);
  }
  return serializeDates(await db.select().from(inventario).where(and(...conditions)).orderBy(desc(inventario.activo), inventario.nombre));
}

export async function getCategoriasInventario(negocioId: string): Promise<string[]> {
  if (isDemoMode()) return ["Styling", "Cuidado", "Barbería", "Herramientas"];
  const rows = await getDb()
    .selectDistinct({ categoria: inventario.categoria })
    .from(inventario)
    .where(eq(inventario.negocioId, negocioId))
    .orderBy(inventario.categoria);
  return rows.map((r) => r.categoria).filter(Boolean) as string[];
}

export async function getArqueoCaja(negocioId: string) {
  if (isDemoMode()) {
    return {
      porMetodo: [
        { metodoPago: "efectivo" as const, turnos: 7, ingresos: 490000, propinas: 30000 },
        { metodoPago: "transferencia" as const, turnos: 8, ingresos: 620000, propinas: 15000 },
        { metodoPago: "tarjeta" as const, turnos: 3, ingresos: 195000, propinas: 0 },
      ],
      total: { turnos: 18, ingresos: 1305000, propinas: 45000 },
    };
  }

  const db = getDb();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const rows = await db
    .select({
      metodoPago: turnos.metodoPago,
      count: sql<number>`count(*)::int`,
      ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
      propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
    })
    .from(turnos)
    .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, todayStart), lte(turnos.createdAt, todayEnd)))
    .groupBy(turnos.metodoPago)
    .orderBy(desc(sql`sum(${turnos.precioFinal} + ${turnos.propina})`));

  const porMetodo = rows.map((r) => ({
    metodoPago: r.metodoPago,
    turnos: r.count,
    ingresos: Number(r.ingresos),
    propinas: Number(r.propinas),
  }));

  const total = porMetodo.reduce(
    (acc, r) => ({ turnos: acc.turnos + r.turnos, ingresos: acc.ingresos + r.ingresos, propinas: acc.propinas + r.propinas }),
    { turnos: 0, ingresos: 0, propinas: 0 },
  );

  return { porMetodo, total };
}

export type AppAlert = {
  label: string;
  detail: string;
  href: string;
  tone: string;
};

export async function getAlerts(negocioId: string): Promise<AppAlert[]> {
  if (isDemoMode()) return [];

  const db = getDb();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [lowStock, pendingToday] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventario)
      .where(and(
        eq(inventario.negocioId, negocioId),
        eq(inventario.activo, true),
        sql`${inventario.stockMinimo} > 0`,
        sql`${inventario.stock} <= ${inventario.stockMinimo}`,
      )),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(citas)
      .where(and(
        eq(citas.negocioId, negocioId),
        sql`${citas.estado} = 'reservada'`,
        gte(citas.inicio, todayStart),
        lte(citas.inicio, todayEnd),
      )),
  ]);

  const result: AppAlert[] = [];

  const stockCount = lowStock[0]?.count ?? 0;
  if (stockCount > 0) {
    result.push({
      label: `${stockCount} producto${stockCount > 1 ? "s" : ""} con stock bajo`,
      detail: "Reabastecer antes de operar",
      href: "/admin/inventario",
      tone: "bg-amber-50 text-amber-700 border border-amber-200",
    });
  }

  const pendingCount = pendingToday[0]?.count ?? 0;
  if (pendingCount > 0) {
    result.push({
      label: `${pendingCount} reserva${pendingCount > 1 ? "s" : ""} sin confirmar hoy`,
      detail: "Revisar y confirmar en Agenda",
      href: "/admin/agenda",
      tone: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    });
  }

  return result;
}
