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
  precioVenta: money.default(0),
  visibleCliente: z.coerce.boolean().default(false),
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

export const citaAdminSchema = z.object({
  clienteId: z.string().uuid(),
  empleadoId: z.string().uuid(),
  servicioId: z.string().uuid(),
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
  estado: z.enum(["reservada", "confirmada"]).default("confirmada"),
});

export const horarioEmpleadoSchema = z.object({
  empleadoId: z.string().uuid(),
  diaSemana: z.coerce.number().int().min(0).max(6),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/),
}).refine((value) => value.horaInicio < value.horaFin, {
  message: "La hora inicio debe ser menor a la hora fin",
  path: ["horaFin"],
});

export const bloqueoEmpleadoSchema = z.object({
  empleadoId: z.string().uuid(),
  fechaInicio: z.string().min(16),
  fechaFin: z.string().min(16),
  motivo: z.string().max(180).optional(),
}).refine((value) => new Date(value.fechaInicio).getTime() < new Date(value.fechaFin).getTime(), {
  message: "La fecha inicio debe ser menor a la fecha fin",
  path: ["fechaFin"],
});

export const estadoCitaSchema = z.object({
  citaId: z.string().uuid(),
  estado: z.enum(["reservada", "confirmada", "cancelada", "no_asistio"]),
});

export const negocioSchema = z.object({
  nombre: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  telefono: z.string().max(30).optional().or(z.literal("")),
  correo: z.string().email().optional().or(z.literal("")),
  direccion: z.string().max(180).optional().or(z.literal("")),
  representante: z.string().max(120).optional().or(z.literal("")),
  tipoDocumento: z.enum(["cc", "ce", "nit", "pasaporte", "pep", "ppt", "ti"]).optional().or(z.literal("")),
  numeroDocumento: z.string().max(40).optional().or(z.literal("")),
  ciudadIndicativo: z.string().max(12).optional().or(z.literal("")),
  contactoPrincipal: z.string().max(30).optional().or(z.literal("")),
  descripcion: z.string().max(600).optional().or(z.literal("")),
  slogan: z.string().max(160).optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  colorPrimario: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  colorSecundario: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  colorAcento: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fuente: z.string().min(2).max(60),
  plan: z.enum(["starter", "pro", "enterprise"]),
  estado: z.enum(["activo", "suspendido", "cancelado"]),
  modoAislamiento: z.enum(["multi_tenant", "dedicado"]),
  fechaFin: z.string().min(10).optional().or(z.literal("")),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(72),
  adminNombre: z.string().min(2).max(120),
  adminTelefono: z.string().min(7).max(30),
});

export const negocioUpdateSchema = negocioSchema.omit({
  adminEmail: true,
  adminPassword: true,
  adminNombre: true,
  adminTelefono: true,
}).extend({
  id: z.string().uuid(),
});

export const negocioUserSchema = z.object({
  negocioId: z.string().uuid(),
  rol: z.enum(["admin", "empleado", "cliente"]),
  nombre: z.string().min(2).max(120),
  telefono: z.string().min(7).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  especialidad: z.enum(["barberia", "peluqueria", "spa_unas", "tatuajes"]).optional().or(z.literal("")),
  comisionPct: z.coerce.number().min(0).max(100).optional(),
});

export const negocioSelfSchema = negocioUpdateSchema.omit({
  id: true,
  slug: true,
  plan: true,
  estado: true,
  modoAislamiento: true,
  fechaFin: true,
}).extend({
  negocioId: z.string().uuid(),
});
