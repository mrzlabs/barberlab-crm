import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const rolUsuario = pgEnum("rol_usuario", ["admin", "empleado", "cliente"]);
export const especialidadEmpleado = pgEnum("especialidad_empleado", ["barberia", "peluqueria", "spa_unas", "tatuajes"]);
export const categoriaServicio = pgEnum("categoria_servicio", ["barberia", "peluqueria", "spa_unas", "tatuajes"]);
export const estadoCita = pgEnum("estado_cita", ["reservada", "confirmada", "realizada", "cancelada", "no_asistio"]);
export const metodoPago = pgEnum("metodo_pago", ["efectivo", "transferencia", "tarjeta"]);
export const categoriaGasto = pgEnum("categoria_gasto", ["arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"]);
export const tipoMovInventario = pgEnum("tipo_mov_inventario", ["entrada", "salida", "ajuste"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  rol: rolUsuario("rol").notNull(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const empleados = pgTable("empleados", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }).unique(),
  especialidad: especialidadEmpleado("especialidad").notNull(),
  comisionPct: numeric("comision_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }).unique(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email"),
  notas: text("notas"),
  ...timestamps,
});

export const servicios = pgTable("servicios", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoria: categoriaServicio("categoria").notNull(),
  nombre: text("nombre").notNull(),
  duracionMin: integer("duracion_min").notNull(),
  precio: numeric("precio", { precision: 12, scale: 2 }).notNull(),
  costoInsumo: numeric("costo_insumo", { precision: 12, scale: 2 }).notNull().default("0"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const horariosEmpleado = pgTable("horarios_empleado", {
  id: uuid("id").primaryKey().defaultRandom(),
  empleadoId: uuid("empleado_id").notNull().references(() => empleados.id, { onDelete: "cascade" }),
  diaSemana: integer("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFin: time("hora_fin").notNull(),
  ...timestamps,
});

export const bloqueosEmpleado = pgTable("bloqueos_empleado", {
  id: uuid("id").primaryKey().defaultRandom(),
  empleadoId: uuid("empleado_id").notNull().references(() => empleados.id, { onDelete: "cascade" }),
  fechaInicio: timestamp("fecha_inicio", { withTimezone: true }).notNull(),
  fechaFin: timestamp("fecha_fin", { withTimezone: true }).notNull(),
  motivo: text("motivo"),
  ...timestamps,
});

export const citas = pgTable("citas", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id").notNull().references(() => clientes.id),
  empleadoId: uuid("empleado_id").notNull().references(() => empleados.id),
  servicioId: uuid("servicio_id").notNull().references(() => servicios.id),
  inicio: timestamp("inicio", { withTimezone: true }).notNull(),
  fin: timestamp("fin", { withTimezone: true }).notNull(),
  estado: estadoCita("estado").notNull().default("reservada"),
  ...timestamps,
});

export const turnos = pgTable("turnos", {
  id: uuid("id").primaryKey().defaultRandom(),
  citaId: uuid("cita_id").notNull().references(() => citas.id).unique(),
  precioFinal: numeric("precio_final", { precision: 12, scale: 2 }).notNull(),
  propina: numeric("propina", { precision: 12, scale: 2 }).notNull().default("0"),
  metodoPago: metodoPago("metodo_pago").notNull(),
  descuento: numeric("descuento", { precision: 12, scale: 2 }).notNull().default("0"),
  observaciones: text("observaciones"),
  ...timestamps,
});

export const gastos = pgTable("gastos", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoria: categoriaGasto("categoria").notNull(),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  fecha: date("fecha").notNull(),
  descripcion: text("descripcion"),
  comprobanteUrl: text("comprobante_url"),
  ...timestamps,
});

export const inventario = pgTable("inventario", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").notNull().unique(),
  nombre: text("nombre").notNull(),
  categoria: text("categoria").notNull(),
  unidad: text("unidad").notNull(),
  stock: numeric("stock", { precision: 12, scale: 2 }).notNull().default("0"),
  costoUnitario: numeric("costo_unitario", { precision: 12, scale: 2 }).notNull().default("0"),
  stockMinimo: numeric("stock_minimo", { precision: 12, scale: 2 }).notNull().default("0"),
  precioVenta: numeric("precio_venta", { precision: 12, scale: 2 }).notNull().default("0"),
  visibleCliente: boolean("visible_cliente").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const movInventario = pgTable("mov_inventario", {
  id: uuid("id").primaryKey().defaultRandom(),
  inventarioId: uuid("inventario_id").notNull().references(() => inventario.id),
  tipo: tipoMovInventario("tipo").notNull(),
  cantidad: numeric("cantidad", { precision: 12, scale: 2 }).notNull(),
  motivo: text("motivo").notNull(),
  citaId: uuid("cita_id").references(() => citas.id, { onDelete: "set null" }),
  fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
});

export const servicioInsumos = pgTable("servicio_insumos", {
  id: uuid("id").primaryKey().defaultRandom(),
  servicioId: uuid("servicio_id").notNull().references(() => servicios.id, { onDelete: "cascade" }),
  inventarioId: uuid("inventario_id").notNull().references(() => inventario.id),
  cantidad: numeric("cantidad", { precision: 12, scale: 2 }).notNull(),
  ...timestamps,
}, (table) => ({
  servicioInventarioUnq: unique().on(table.servicioId, table.inventarioId),
}));

export const citaHistorial = pgTable("cita_historial", {
  id: uuid("id").primaryKey().defaultRandom(),
  citaId: uuid("cita_id").notNull().references(() => citas.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => usuarios.id, { onDelete: "set null" }),
  actorRol: rolUsuario("actor_rol"),
  estadoAnterior: estadoCita("estado_anterior"),
  estadoNuevo: estadoCita("estado_nuevo"),
  accion: text("accion").notNull(),
  detalle: text("detalle"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
