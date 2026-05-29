import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  citas,
  empleados,
  gastos,
  inventario,
  servicioInsumos,
  servicios,
  turnos,
  usuarios,
} from "@/lib/db/schema";
import { toDateInput } from "@/lib/admin/format";

export type ReportRange = {
  from: string;
  to: string;
};

function defaultRange(): ReportRange {
  const now = new Date();
  return {
    from: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toDateInput(now),
  };
}

export function parseRange(params?: Record<string, string | string[] | undefined>): ReportRange {
  const defaults = defaultRange();
  const from = Array.isArray(params?.from) ? params?.from[0] : params?.from;
  const to = Array.isArray(params?.to) ? params?.to[0] : params?.to;
  return {
    from: from || defaults.from,
    to: to || defaults.to,
  };
}

function rangeDates(range: ReportRange) {
  const from = new Date(`${range.from}T00:00:00-05:00`);
  const to = new Date(`${range.to}T23:59:59-05:00`);
  return { from, to };
}

export async function getReportes(range: ReportRange) {
  const db = getDb();
  const { from, to } = rangeDates(range);

  const [kpis, gastosPeriodo, noAsistencia, byService, byEmployee, byPayment] = await Promise.all([
    db
      .select({
        turnos: sql<number>`count(${turnos.id})::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
        costoInsumo: sql<string>`coalesce(sum((
          select coalesce(sum(si.cantidad * i.costo_unitario), 0)
          from ${servicioInsumos} si
          inner join ${inventario} i on i.id = si.inventario_id
          where si.servicio_id = ${citas.servicioId}
        )), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .where(and(gte(turnos.createdAt, from), lte(turnos.createdAt, to))),
    db
      .select({ total: sql<string>`coalesce(sum(${gastos.monto}), 0)` })
      .from(gastos)
      .where(and(gte(gastos.fecha, range.from), lte(gastos.fecha, range.to))),
    db
      .select({
        total: sql<number>`count(*)::int`,
        noAsistio: sql<number>`count(*) filter (where ${citas.estado} = 'no_asistio')::int`,
      })
      .from(citas)
      .where(and(gte(citas.inicio, from), lte(citas.inicio, to))),
    db
      .select({
        servicio: servicios.nombre,
        categoria: servicios.categoria,
        turnos: sql<number>`count(${turnos.id})::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        costoInsumo: sql<string>`coalesce(sum((
          select coalesce(sum(si.cantidad * i.costo_unitario), 0)
          from ${servicioInsumos} si
          inner join ${inventario} i on i.id = si.inventario_id
          where si.servicio_id = ${servicios.id}
        )), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .innerJoin(servicios, eq(citas.servicioId, servicios.id))
      .where(and(gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
      .groupBy(servicios.id)
      .orderBy(desc(sql`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`)),
    db
      .select({
        empleado: usuarios.nombre,
        especialidad: empleados.especialidad,
        comisionPct: empleados.comisionPct,
        turnos: sql<number>`count(${turnos.id})::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal}), 0)`,
        propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
        comision: sql<string>`coalesce(sum(${turnos.precioFinal} * (${empleados.comisionPct} / 100)), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
      .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
      .where(and(gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
      .groupBy(usuarios.id, empleados.id)
      .orderBy(desc(sql`coalesce(sum(${turnos.precioFinal}), 0)`)),
    db
      .select({
        metodoPago: turnos.metodoPago,
        turnos: sql<number>`count(*)::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
      })
      .from(turnos)
      .where(and(gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
      .groupBy(turnos.metodoPago)
      .orderBy(desc(sql`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`)),
  ]);

  const ingresos = Number(kpis[0]?.ingresos ?? 0);
  const costoInsumo = Number(kpis[0]?.costoInsumo ?? 0);
  const gastoTotal = Number(gastosPeriodo[0]?.total ?? 0);
  const citasTotal = noAsistencia[0]?.total ?? 0;
  const citasNoAsistio = noAsistencia[0]?.noAsistio ?? 0;

  return {
    kpis: {
      turnos: kpis[0]?.turnos ?? 0,
      ingresos,
      propinas: Number(kpis[0]?.propinas ?? 0),
      ticket: Number(kpis[0]?.ticket ?? 0),
      costoInsumo,
      gastos: gastoTotal,
      margenBruto: ingresos - costoInsumo - gastoTotal,
      tasaNoAsistencia: citasTotal ? citasNoAsistio / citasTotal : 0,
    },
    byService: byService.map((item) => {
      const ingreso = Number(item.ingresos);
      const costo = Number(item.costoInsumo);
      return {
        ...item,
        ingresos: ingreso,
        costoInsumo: costo,
        margen: ingreso - costo,
        rentabilidad: ingreso ? (ingreso - costo) / ingreso : 0,
      };
    }),
    byEmployee: byEmployee.map((item) => ({
      ...item,
      ingresos: Number(item.ingresos),
      propinas: Number(item.propinas),
      comision: Number(item.comision),
    })),
    byPayment: byPayment.map((item) => ({
      ...item,
      ingresos: Number(item.ingresos),
    })),
  };
}
