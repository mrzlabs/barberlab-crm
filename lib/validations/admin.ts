import { z } from "zod";

const money = z.coerce.number().min(0);
const qty = z.coerce.number();

export const gastoSchema = z.object({
  categoria: z.enum(["arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"]),
  monto: money,
  fecha: z.string().trim().min(10),
  descripcion: z.string().trim().max(300).optional(),
  comprobanteUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const inventarioSchema = z.object({
  sku: z.string().trim().min(2).max(40),
  nombre: z.string().trim().min(2).max(120),
  categoria: z.string().trim().min(2).max(80),
  unidad: z.string().trim().min(1).max(30),
  descripcion: z.string().trim().max(600).optional().or(z.literal("")),
  stock: money,
  costoUnitario: money,
  stockMinimo: money,
  precioVenta: money.default(0),
  fotoUrl: z.string().trim().url().optional().or(z.literal("")),
  visibleCliente: z.coerce.boolean().default(false),
  activo: z.coerce.boolean().default(true),
});

export const movInventarioSchema = z.object({
  inventarioId: z.string().trim().uuid(),
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: qty.refine((value) => value !== 0, "La cantidad no puede ser cero"),
  motivo: z.string().trim().min(3).max(160),
});

export const turnoSchema = z.object({
  citaId: z.string().trim().uuid(),
  precioFinal: money,
  propina: money.default(0),
  metodoPago: z.enum(["efectivo", "transferencia", "tarjeta"]),
  descuento: money.default(0),
  observaciones: z.string().trim().max(300).optional(),
});

export const citaAdminSchema = z.object({
  clienteId: z.string().trim().uuid(),
  empleadoId: z.string().trim().uuid(),
  servicioId: z.string().trim().uuid(),
  inicio: z.string().trim().datetime(),
  fin: z.string().trim().datetime(),
  estado: z.enum(["reservada", "confirmada"]).default("confirmada"),
});

export const horarioEmpleadoSchema = z.object({
  empleadoId: z.string().trim().uuid(),
  diaSemana: z.coerce.number().int().min(0).max(6),
  horaInicio: z.string().trim().regex(/^\d{2}:\d{2}$/),
  horaFin: z.string().trim().regex(/^\d{2}:\d{2}$/),
}).refine((value) => value.horaInicio < value.horaFin, {
  message: "La hora inicio debe ser menor a la hora fin",
  path: ["horaFin"],
});

export const bloqueoEmpleadoSchema = z.object({
  empleadoId: z.string().trim().uuid(),
  fechaInicio: z.string().trim().min(16),
  fechaFin: z.string().trim().min(16),
  motivo: z.string().trim().max(180).optional(),
}).refine((value) => new Date(value.fechaInicio).getTime() < new Date(value.fechaFin).getTime(), {
  message: "La fecha inicio debe ser menor a la fecha fin",
  path: ["fechaFin"],
});

export const estadoCitaSchema = z.object({
  citaId: z.string().trim().uuid(),
  estado: z.enum(["reservada", "confirmada", "cancelada", "no_asistio"]),
});

export const negocioSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
  correo: z.string().trim().email().optional().or(z.literal("")),
  direccion: z.string().trim().max(180).optional().or(z.literal("")),
  representante: z.string().trim().max(120).optional().or(z.literal("")),
  tipoDocumento: z.enum(["cc", "ce", "nit", "pasaporte", "pep", "ppt", "ti"]).optional().or(z.literal("")),
  numeroDocumento: z.string().trim().max(40).optional().or(z.literal("")),
  ciudadIndicativo: z.string().trim().max(12).optional().or(z.literal("")),
  contactoPrincipal: z.string().trim().max(30).optional().or(z.literal("")),
  descripcion: z.string().trim().max(600).optional().or(z.literal("")),
  slogan: z.string().trim().max(160).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  colorPrimario: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  colorSecundario: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  colorAcento: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  fuente: z.string().trim().min(2).max(60),
  plan: z.enum(["starter", "pro", "enterprise"]),
  estado: z.enum(["activo", "suspendido", "cancelado"]),
  modoAislamiento: z.enum(["multi_tenant", "dedicado"]),
  comisionBase: z.enum(["precio_final", "precio_menos_descuento", "precio_menos_insumo"]).default("precio_final"),
  propinaEnComision: z.coerce.boolean().default(false),
  fechaFin: z.string().trim().min(10).optional().or(z.literal("")),
  adminEmail: z.string().trim().email(),
  adminPassword: z.string().trim().min(8).max(72),
  adminNombre: z.string().trim().min(2).max(120),
  adminTelefono: z.string().trim().min(7).max(30),
});

export const negocioUpdateSchema = negocioSchema.omit({
  adminEmail: true,
  adminPassword: true,
  adminNombre: true,
  adminTelefono: true,
}).extend({
  id: z.string().trim().uuid(),
});

export const negocioSuperAdminSchema = z.object({
  id: z.string().trim().uuid(),
  nombre: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
  correo: z.string().trim().email().optional().or(z.literal("")),
  direccion: z.string().trim().max(180).optional().or(z.literal("")),
  plan: z.enum(["starter", "pro", "enterprise"]),
  estado: z.enum(["activo", "suspendido"]),
  fechaFin: z.string().trim().min(10).optional().or(z.literal("")),
});

export const negocioUserSchema = z.object({
  negocioId: z.string().trim().uuid(),
  rol: z.enum(["admin", "empleado", "cliente"]),
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().min(7).max(30),
  email: z.string().trim().email(),
  password: z.string().trim().min(8).max(72),
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
  negocioId: z.string().trim().uuid(),
});

export const configVisualSchema = z.object({
  darkMode: z.coerce.boolean().default(false),
  fontFamily: z.enum(["Inter", "Poppins", "Montserrat", "Raleway", "DM Sans", "Playfair Display", "Space Grotesk"]).default("Inter"),
});

