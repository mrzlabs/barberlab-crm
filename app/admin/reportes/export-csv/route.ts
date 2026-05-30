import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getReportes, parseRange } from "@/lib/admin/reports";

function esc(value: string | number): string {
  const s = String(value);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(esc).join(",")).join("\n");
}

export async function GET(request: NextRequest) {
  await requireRole(["admin", "super_admin"]);

  const sp = request.nextUrl.searchParams;
  const range = parseRange(Object.fromEntries(sp));
  const tipo = sp.get("tipo") ?? "servicios";
  const r = await getReportes(range);

  let csv: string;
  let filename: string;

  if (tipo === "empleados") {
    csv = toCsv([
      ["Empleado", "Especialidad", "Turnos", "Produccion", "Propinas", "Costo Insumo", "Comision", "Utilidad Negocio"],
      ...r.byEmployee.map((e) => [
        e.empleado,
        e.especialidad.replace("_", " "),
        e.turnos,
        e.ingresos,
        e.propinas,
        e.costoInsumo,
        e.comision,
        e.utilidadNegocio,
      ]),
    ]);
    filename = `empleados_${range.from}_${range.to}.csv`;
  } else if (tipo === "pagos") {
    csv = toCsv([
      ["Metodo Pago", "Turnos", "Ingresos"],
      ...r.byPayment.map((p) => [p.metodoPago, p.turnos, p.ingresos]),
    ]);
    filename = `pagos_${range.from}_${range.to}.csv`;
  } else {
    csv = toCsv([
      ["Servicio", "Categoria", "Turnos", "Ingresos", "Costo Insumo", "Comision", "Utilidad Neta", "Rentabilidad Neta %"],
      ...r.byService.map((s) => [
        s.servicio,
        s.categoria.replace("_", " "),
        s.turnos,
        s.ingresos,
        s.costoInsumo,
        s.comision,
        s.utilidadNeta,
        (s.rentabilidadNeta * 100).toFixed(1),
      ]),
    ]);
    filename = `servicios_${range.from}_${range.to}.csv`;
  }

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
