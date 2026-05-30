"use client";

import { Download, Printer } from "lucide-react";

type ServiceRow = {
  servicio: string; categoria: string; turnos: number;
  ingresos: number; costoInsumo: number; comision: number;
  margen: number; utilidadNeta: number; rentabilidad: number; rentabilidadNeta: number;
};
type EmployeeRow = {
  empleado: string; especialidad: string; turnos: number;
  ingresos: number; propinas: number; costoInsumo: number; comision: number; utilidadNegocio: number;
};
type PaymentRow = { metodoPago: string; ingresos: number; turnos: number };
type Kpis = {
  ingresos: number; margenBruto: number; ticket: number;
  propinas: number; costoInsumo: number; gastos: number; comisiones: number; utilidadNeta: number;
  turnos: number; tasaNoAsistencia: number;
};

function fmt(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}
function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
function esc(v: string | number) {
  return `"${String(v).replace(/"/g, '""')}"`;
}

export function ExportButtons({
  byService, byEmployee, byPayment, kpis, from, to,
}: {
  byService: ServiceRow[];
  byEmployee: EmployeeRow[];
  byPayment: PaymentRow[];
  kpis: Kpis;
  from: string;
  to: string;
}) {
  const handleCSV = () => {
    const rows: (string | number)[][] = [
      ["BarberLab CRM — Reporte de rentabilidad"],
      [`Periodo: ${from} al ${to}`],
      [],
      ["── KPIs del periodo ──"],
      ["Ingresos", "Margen bruto", "Utilidad neta", "Ticket promedio", "Propinas", "Costo insumo", "Gastos", "Comisiones", "Turnos", "No asistencia"],
      [kpis.ingresos, kpis.margenBruto, kpis.utilidadNeta, kpis.ticket, kpis.propinas, kpis.costoInsumo, kpis.gastos, kpis.comisiones, kpis.turnos, pct(kpis.tasaNoAsistencia)],
      [],
      ["── Rentabilidad por servicio ──"],
      ["Servicio", "Categoría", "Turnos", "Ingresos", "Costo insumo", "Comisión", "Margen bruto", "Utilidad neta", "Rentabilidad bruta", "Rentabilidad neta"],
      ...byService.map((s) => [s.servicio, s.categoria, s.turnos, fmt(s.ingresos), fmt(s.costoInsumo), fmt(s.comision), fmt(s.margen), fmt(s.utilidadNeta), pct(s.rentabilidad), pct(s.rentabilidadNeta)]),
      [],
      ["── Producción por empleado ──"],
      ["Empleado", "Especialidad", "Turnos", "Ingreso total", "Costo insumo", "Comisión estimada", "Utilidad negocio"],
      ...byEmployee.map((e) => [e.empleado, e.especialidad, e.turnos, fmt(e.ingresos + e.propinas), fmt(e.costoInsumo), fmt(e.comision), fmt(e.utilidadNegocio)]),
      [],
      ["── Método de pago ──"],
      ["Método", "Ingresos", "Turnos"],
      ...byPayment.map((p) => [p.metodoPago, fmt(p.ingresos), p.turnos]),
    ];

    const csv = rows.map((row) => row.map(esc).join(",")).join("\r\n");
    const bom = "﻿"; // UTF-8 BOM para Excel
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barberlab-reporte-${from}_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePDF = () => window.print();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white/18 no-print"
        onClick={handleCSV}
        type="button"
      >
        <Download className="size-3.5" />
        CSV
      </button>
      <button
        className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-950 transition hover:bg-cyan-300 no-print"
        onClick={handlePDF}
        type="button"
      >
        <Printer className="size-3.5" />
        PDF
      </button>
    </div>
  );
}
