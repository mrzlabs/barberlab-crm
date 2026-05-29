import { z } from "zod";

const money = z.coerce.number().min(0);
const qty = z.coerce.number();

export const gastoSchema = z.object({
  categoria: z.enum(["arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"]),
  monto: money,
  fecha: z.string().min(10),
  descripcion: z.string().max(300).optional(),
  comprobanteUrl: z.string().url().optional().or(z.literal("")),
});

export const inventarioSchema = z.object({
  sku: z.string().min(2).max(40),
  nombre: z.string().min(2).max(120),
  categoria: z.string().min(2).max(80),
  unidad: z.string().min(1).max(30),
  stock: money,
  costoUnitario: money,
  stockMinimo: money,
  activo: z.coerce.boolean().default(true),
});

export const movInventarioSchema = z.object({
  inventarioId: z.string().uuid(),
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: qty.refine((value) => value !== 0, "La cantidad no puede ser cero"),
  motivo: z.string().min(3).max(160),
});

export const turnoSchema = z.object({
  citaId: z.string().uuid(),
  precioFinal: money,
  propina: money.default(0),
  metodoPago: z.enum(["efectivo", "transferencia", "tarjeta"]),
  descuento: money.default(0),
  observaciones: z.string().max(300).optional(),
});
