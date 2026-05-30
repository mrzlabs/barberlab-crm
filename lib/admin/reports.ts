import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import {
  citas,
  empleados,
  gastos,
  inventario,
  negocios,
  servicioInsumos,
  servicios,
  turnos,
  usuarios,
} from "@/lib/db/schema";
import { toDateInput } from "@/lib/admin/format";
import { getCurrentProfile } from "@/lib/auth/session";

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
  if (isDemoMode()) {
    return {
      settings: {
        comisionBase: "precio_final" as const,
        propinaEnComision: false,
      },
      kpis: {
        turnos: 286,
        ingresos: 36500000,
        propinas: 1250000,
        ticket: 76500,
        costoInsumo: 4850000,
        gastos: 9400000,
        comisiones: 9132000,
        margenBruto: 22250000,
        utilidadNeta: 13118000,
        tasaNoAsistencia: 0.047,
      },
      byService: [
        { servicio: "Corte premium", categoria: "barberia" as const, turnos: 112, ingresos: 7840000, costoInsumo: 640000, comision: 3136000, margen: 7200000, utilidadNeta: 4064000, rentabilidad: 0.918, rentabilidadNeta: 0.518 },
        { servicio: "Corte y barba", categoria: "barberia" as const, turnos: 86, ingresos: 5590000, costoInsumo: 520000, comision: 2236000, margen: 5070000, utilidadNeta: 2834000, rentabilidad: 0.907, rentabilidadNeta: 0.507 },
        { servicio: "Manicure semipermanente", categoria: "spa_unas" as const, turnos: 54, ingresos: 4320000, costoInsumo: 980000, comision: 1512000, margen: 3340000, utilidadNeta: 1828000, rentabilidad: 0.773, rentabilidadNeta: 0.423 },
      ],
      byEmployee: [
        { empleado: "Mateo Barber", especialidad: "barberia" as const, comisionPct: "40", turnos: 148, ingresos: 11400000, propinas: 560000, costoInsumo: 940000, comision: 4560000, utilidadNegocio: 6460000 },
        { empleado: "Sofia Nails", especialidad: "spa_unas" as const, comisionPct: "35", turnos: 54, ingresos: 4320000, propinas: 210000, costoInsumo: 980000, comision: 1512000, utilidadNegocio: 2038000 },
        { empleado: "Nico Ink", especialidad: "tatuajes" as const, comisionPct: "45", turnos: 18, ingresos: 6800000, propinas: 300000, costoInsumo: 1380000, comision: 3060000, utilidadNegocio: 2660000 },
      ],
      byPayment: [
        { metodoPago: "transferencia" as const, turnos: 142, ingresos: 18400000 },
        { metodoPago: "tarjeta" as const, turnos: 91, ingresos: 12400000 },
        { metodoPago: "efectivo" as const, turnos: 53, ingresos: 5700000 },
      ],
    };
  }

  const db = getDb();
  const { from, to } = rangeDates(range);
  const profile = await getCurrentProfile();
  const negocioId = profile?.negocioId || "00000000-0000-0000-0000-000000000000";
  const [config] = await db
    .select({
      comisionBase: negocios.comisionBase,
      propinaEnComision: negocios.propinaEnComision,
    })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);
  const comisionBase = config?.comisionBase ?? "precio_final";
  const propinaEnComision = config?.propinaEnComision ?? false;
  const costByTurn = sql<number>`(
    select coalesce(sum(si.cantidad * i.costo_unitario), 0)
    from ${servicioInsumos} si
    inner join ${inventario} i on i.id = si.inventario_id
    where si.servicio_id = ${citas.servicioId}
  )`;
  const commissionBaseExpr =
    comisionBase === "precio_menos_insumo"
      ? sql<number>`greatest(${turnos.precioFinal} - ${costByTurn}, 0)`
      : comisionBase === "precio_menos_descuento"
        ? sql<number>`greatest(${turnos.precioFinal} - ${turnos.descuento}, 0)`
        : sql<number>`${turnos.precioFinal}`;
  const commissionableExpr = propinaEnComision
    ? sql<number>`(${commissionBaseExpr} + ${turnos.propina})`
    : commissionBaseExpr;
  const commissionExpr = sql<number>`(${commissionableExpr} * (${empleados.comisionPct} / 100))`;

  const [kpis, gastosPeriodo, noAsistencia, byService, byEmployee, byPayment] = await Promise.all([
    db
      .select({
        turnos: sql<number>`count(${turnos.id})::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        propinas: sql<string>`coalesce(sum(${turnos.propina}), 0)`,
        ticket: sql<string>`coalesce(avg(${turnos.precioFinal}), 0)`,
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
        comisiones: sql<string>`coalesce(sum(${commissionExpr}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, from), lte(turnos.createdAt, to))),
    db
      .select({ total: sql<string>`coalesce(sum(${gastos.monto}), 0)` })
      .from(gastos)
      .where(and(eq(gastos.negocioId, negocioId), gte(gastos.fecha, range.from), lte(gastos.fecha, range.to))),
    db
      .select({
        total: sql<number>`count(*)::int`,
        noAsistio: sql<number>`count(*) filter (where ${citas.estado} = 'no_asistio')::int`,
      })
      .from(citas)
      .where(and(eq(citas.negocioId, negocioId), gte(citas.inicio, from), lte(citas.inicio, to))),
    db
      .select({
        servicio: servicios.nombre,
        categoria: servicios.categoria,
        turnos: sql<number>`count(${turnos.id})::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
        comision: sql<string>`coalesce(sum(${commissionExpr}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .innerJoin(servicios, eq(citas.servicioId, servicios.id))
      .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
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
        costoInsumo: sql<string>`coalesce(sum(${costByTurn}), 0)`,
        comision: sql<string>`coalesce(sum(${commissionExpr}), 0)`,
      })
      .from(turnos)
      .innerJoin(citas, eq(turnos.citaId, citas.id))
      .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
      .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
      .groupBy(usuarios.id, empleados.id)
      .orderBy(desc(sql`coalesce(sum(${turnos.precioFinal}), 0)`)),
    db
      .select({
        metodoPago: turnos.metodoPago,
        turnos: sql<number>`count(*)::int`,
        ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
      })
      .from(turnos)
      .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
      .groupBy(turnos.metodoPago)
      .orderBy(desc(sql`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`)),
  ]);

  const ingresos = Number(kpis[0]?.ingresos ?? 0);
  const costoInsumo = Number(kpis[0]?.costoInsumo ?? 0);
  const comisiones = Number(kpis[0]?.comisiones ?? 0);
  const gastoTotal = Number(gastosPeriodo[0]?.total ?? 0);
  const citasTotal = noAsistencia[0]?.total ?? 0;
  const citasNoAsistio = noAsistencia[0]?.noAsistio ?? 0;

  return {
    settings: {
      comisionBase,
      propinaEnComision,
    },
    kpis: {
      turnos: kpis[0]?.turnos ?? 0,
      ingresos,
      propinas: Number(kpis[0]?.propinas ?? 0),
      ticket: Number(kpis[0]?.ticket ?? 0),
      costoInsumo,
      gastos: gastoTotal,
      comisiones,
      margenBruto: ingresos - costoInsumo - gastoTotal,
      utilidadNeta: ingresos - costoInsumo - gastoTotal - comisiones,
      tasaNoAsistencia: citasTotal ? citasNoAsistio / citasTotal : 0,
    },
    byService: byService.map((item) => {
      const ingreso = Number(item.ingresos);
      const costo = Number(item.costoInsumo);
      const comision = Number(item.comision);
      return {
        ...item,
        ingresos: ingreso,
        costoInsumo: costo,
        comision,
        margen: ingreso - costo,
        utilidadNeta: ingreso - costo - comision,
        rentabilidad: ingreso ? (ingreso - costo) / ingreso : 0,
        rentabilidadNeta: ingreso ? (ingreso - costo - comision) / ingreso : 0,
      };
    }),
    byEmployee: byEmployee.map((item) => ({
      ...item,
      ingresos: Number(item.ingresos),
      propinas: Number(item.propinas),
      costoInsumo: Number(item.costoInsumo),
      comision: Number(item.comision),
      utilidadNegocio: Number(item.ingresos) + Number(item.propinas) - Number(item.costoInsumo) - Number(item.comision),
    })),
    byPayment: byPayment.map((item) => ({
      ...item,
      ingresos: Number(item.ingresos),
    })),
  };
}

export type TrendPoint = { fecha: string; ingresos: number; turnos: number };

export async function getTrendDiaria(range: ReportRange): Promise<TrendPoint[]> {
  if (isDemoMode()) {
    const seed = [1200000, 980000, 1450000, 890000, 1320000, 1100000, 760000, 1500000, 1280000, 920000, 1380000, 1050000, 1600000, 870000, 1250000, 1420000, 990000, 1180000, 1340000, 800000, 1470000, 1020000, 1300000, 1150000, 1390000, 940000, 1230000, 1480000, 1060000, 1420000];
    const result: TrendPoint[] = [];
    const cursor = new Date(`${range.from}T12:00:00`);
    const toDate = new Date(`${range.to}T12:00:00`);
    let i = 0;
    while (cursor <= toDate && i < 62) {
      result.push({ fecha: cursor.toISOString().slice(0, 10), ingresos: seed[i % seed.length], turnos: Math.floor(seed[i % seed.length] / 108000) });
      cursor.setDate(cursor.getDate() + 1);
      i++;
    }
    return result;
  }

  const db = getDb();
  const { from, to } = rangeDates(range);
  const profile = await getCurrentProfile();
  const negocioId = profile?.negocioId || "00000000-0000-0000-0000-000000000000";

  const rows = await db
    .select({
      fecha: sql<string>`date(${turnos.createdAt} AT TIME ZONE 'America/Bogota')`,
      ingresos: sql<string>`coalesce(sum(${turnos.precioFinal} + ${turnos.propina}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(turnos)
    .where(and(eq(turnos.negocioId, negocioId), gte(turnos.createdAt, from), lte(turnos.createdAt, to)))
    .groupBy(sql`date(${turnos.createdAt} AT TIME ZONE 'America/Bogota')`)
    .orderBy(asc(sql`date(${turnos.createdAt} AT TIME ZONE 'America/Bogota')`));

  return rows.map((r) => ({ fecha: r.fecha, ingresos: Number(r.ingresos), turnos: r.count }));
}
