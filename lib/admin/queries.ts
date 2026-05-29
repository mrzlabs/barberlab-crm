import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  citas,
  clientes,
  empleados,
  gastos,
  inventario,
  servicios,
  turnos,
  usuarios,
} from "@/lib/db/schema";
import { toDateInput } from "@/lib/admin/format";

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

export async function getDashboard() {
  const db = getDb();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = startOfMonth();
  const today = toDateInput();

  const [todayTurnos, monthTurnos, todayGastos, monthGastos, lowStock, todayCitas] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
      })
      .from(turnos)
      .where(and(gte(turnos.createdAt, todayStart), lte(turnos.createdAt, todayEnd))),
    db
      .select({
        count: sql<number>`count(*)::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
      })
      .from(turnos)
      .where(gte(turnos.createdAt, monthStart)),
    db
      .select({ total: sql<string>`coalesce(sum(${gastos.monto}), 0)` })
      .from(gastos)
      .where(eq(gastos.fecha, today)),
    db
      .select({ total: sql<string>`coalesce(sum(${gastos.monto}), 0)` })
      .from(gastos)
      .where(gte(gastos.fecha, toDateInput(monthStart))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventario)
      .where(and(eq(inventario.activo, true), sql`${inventario.stock} <= ${inventario.stockMinimo}`)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(citas)
      .where(and(gte(citas.inicio, todayStart), lte(citas.inicio, todayEnd))),
  ]);

  const todayIncome = Number(todayTurnos[0]?.ingresos ?? 0);
  const todayExpense = Number(todayGastos[0]?.total ?? 0);
  const monthIncome = Number(monthTurnos[0]?.ingresos ?? 0);
  const monthExpense = Number(monthGastos[0]?.total ?? 0);

  return {
    today: {
      turnos: todayTurnos[0]?.count ?? 0,
      citas: todayCitas[0]?.count ?? 0,
      ingresos: todayIncome,
      gastos: todayExpense,
      margen: todayIncome - todayExpense,
      propinas: Number(todayTurnos[0]?.propinas ?? 0),
      ticket: Number(todayTurnos[0]?.ticket ?? 0),
    },
    month: {
      turnos: monthTurnos[0]?.count ?? 0,
      ingresos: monthIncome,
      gastos: monthExpense,
      margen: monthIncome - monthExpense,
      ticket: Number(monthTurnos[0]?.ticket ?? 0),
    },
    lowStock: lowStock[0]?.count ?? 0,
  };
}

export async function getRecentTurnos() {
  const db = getDb();
  return db
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
    .orderBy(desc(turnos.createdAt))
    .limit(12);
}

export async function getPendingCitas() {
  const db = getDb();
  return db
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
    .where(sql`${citas.estado} in ('reservada', 'confirmada')`)
    .orderBy(desc(citas.inicio))
    .limit(20);
}

export async function getGastos() {
  const db = getDb();
  return db.select().from(gastos).orderBy(desc(gastos.fecha), desc(gastos.createdAt)).limit(40);
}

export async function getInventario() {
  const db = getDb();
  return db.select().from(inventario).orderBy(desc(inventario.activo), inventario.nombre);
}
