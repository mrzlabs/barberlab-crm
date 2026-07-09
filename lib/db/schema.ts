import {
  boolean,
  date,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export type ConfigVisual = {
  darkMode?: boolean;
  fontFamily?: string | null;
  bgPhotoUrl?: string | null;
  bgPhotoStoragePath?: string | null;
  whatsapp_phone?: string | null;
  whatsapp_enabled?: boolean;
  whatsapp_templates?: {
    confirmacion?: string;
    recordatorio?: string;
    seguimiento?: string;
  } | null;
};

/** Vertical del negocio: ajusta vocabulario y módulos del CRM. */
export type NegocioVertical = "barberia" | "peluqueria" | "spa_unas" | "tatuajes" | "restaurante" | "otro";

/** Estado de una integración solicitada por el negocio (modelo FloorUX). */
export type IntegracionEstado = {
  status: "pendiente" | "activa";
  managed: boolean;
  handle?: string;
  requestedAt: string;
  activatedAt?: string;
};

export type NegocioSettings = {
  vertical?: NegocioVertical;
  integraciones?: Record<string, IntegracionEstado>;
  puntos?: {
    habilitado?: boolean;
    /** Pesos de consumo que otorgan 1 punto (ej. 1000 = 1 punto por cada $1.000). */
    pesosPorPunto?: number;
    /** Valor en pesos de 1 punto al canjear. */
    valorPunto?: number;
    /** Mínimo de puntos para poder canjear. */
    minCanje?: number;
    /** Puntos de bienvenida al registrarse desde la página pública. */
    bonoRegistro?: number;
  };
  politicas?: {
    /** Texto de tratamiento de datos mostrado en el registro público. */
    textoRegistro?: string;
    /** Exigir consentimiento explícito al registrar clientes. */
    consentimientoObligatorio?: boolean;
  };
};

export const rolUsuario = pgEnum("rol_usuario", ["super_admin", "admin", "empleado", "cliente"]);
export const especialidadEmpleado = pgEnum("especialidad_empleado", ["barberia", "peluqueria", "spa_unas", "tatuajes"]);
export const categoriaServicio = pgEnum("categoria_servicio", ["barberia", "peluqueria", "spa_unas", "tatuajes"]);
export const estadoCita = pgEnum("estado_cita", ["reservada", "confirmada", "realizada", "cancelada", "no_asistio"]);
export const metodoPago = pgEnum("metodo_pago", ["efectivo", "transferencia", "tarjeta"]);
export const categoriaGasto = pgEnum("categoria_gasto", ["arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"]);
export const tipoMovInventario = pgEnum("tipo_mov_inventario", ["entrada", "salida", "ajuste"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
};

export const negocios = pgTable("negocios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  telefono: text("telefono"),
  correo: text("correo"),
  direccion: text("direccion"),
  representante: text("representante"),
  tipoDocumento: text("tipo_documento"),
  numeroDocumento: text("numero_documento"),
  ciudadIndicativo: text("ciudad_indicativo"),
  contactoPrincipal: text("contacto_principal"),
  descripcion: text("descripcion"),
  slogan: text("slogan"),
  logoUrl: text("logo_url"),
  colorPrimario: text("color_primario").notNull().default("#111827"),
  colorSecundario: text("color_secundario").notNull().default("#22d3ee"),
  colorAcento: text("color_acento").notNull().default("#7c3aed"),
  fuente: text("fuente").notNull().default("Inter"),
  configVisual: json("config_visual").$type<ConfigVisual>().notNull().default({}),
  settings: json("settings").$type<NegocioSettings>().notNull().default({}),
  plan: text("plan").notNull().default("starter"),
  estado: text("estado").notNull().default("activo"),
  modoAislamiento: text("modo_aislamiento").notNull().default("multi_tenant"),
  comisionBase: text("comision_base").notNull().default("precio_final"),
  propinaEnComision: boolean("propina_en_comision").notNull().default(false),
  fechaInicio: date("fecha_inicio", { mode: "string" }).notNull(),
  fechaFin: date("fecha_fin", { mode: "string" }),
  ...timestamps,
});

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  email: text("email").notNull().unique(),
  rol: rolUsuario("rol").notNull(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono"),
  superAdmin: boolean("super_admin").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  ...timestamps,
});

export const empleados = pgTable("empleados", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }).unique(),
  especialidad: especialidadEmpleado("especialidad").notNull(),
  comisionPct: numeric("comision_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
});

export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }).unique(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email"),
  notas: text("notas"),
  cumpleanos: date("cumpleanos", { mode: "string" }),
  puntos: integer("puntos").notNull().default(0),
  aceptaComunicaciones: boolean("acepta_comunicaciones").notNull().default(false),
  ...timestamps,
});

/** Trazabilidad del sistema de puntos: cada acreditación o canje queda registrado. */
export const puntosMovimientos = pgTable("puntos_movimientos", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  clienteId: uuid("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  motivo: text("motivo").notNull(),
  citaId: uuid("cita_id").references(() => citas.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const servicios = pgTable("servicios", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
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
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  empleadoId: uuid("empleado_id").notNull().references(() => empleados.id, { onDelete: "cascade" }),
  diaSemana: integer("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFin: time("hora_fin").notNull(),
  ...timestamps,
});

export const bloqueosEmpleado = pgTable("bloqueos_empleado", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  empleadoId: uuid("empleado_id").notNull().references(() => empleados.id, { onDelete: "cascade" }),
  fechaInicio: timestamp("fecha_inicio", { withTimezone: true, mode: "string" }).notNull(),
  fechaFin: timestamp("fecha_fin", { withTimezone: true, mode: "string" }).notNull(),
  motivo: text("motivo"),
  ...timestamps,
});

export const citas = pgTable("citas", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  clienteId: uuid("cliente_id").notNull().references(() => clientes.id),
  empleadoId: uuid("empleado_id").notNull().references(() => empleados.id),
  servicioId: uuid("servicio_id").notNull().references(() => servicios.id),
  inicio: timestamp("inicio", { withTimezone: true, mode: "string" }).notNull(),
  fin: timestamp("fin", { withTimezone: true, mode: "string" }).notNull(),
  estado: estadoCita("estado").notNull().default("reservada"),
  ...timestamps,
});

export const turnos = pgTable("turnos", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
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
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  categoria: categoriaGasto("categoria").notNull(),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  fecha: date("fecha", { mode: "string" }).notNull(),
  descripcion: text("descripcion"),
  comprobanteUrl: text("comprobante_url"),
  ...timestamps,
});

export const inventario = pgTable("inventario", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  sku: text("sku").notNull(),
  nombre: text("nombre").notNull(),
  categoria: text("categoria").notNull(),
  unidad: text("unidad").notNull(),
  stock: numeric("stock", { precision: 12, scale: 2 }).notNull().default("0"),
  costoUnitario: numeric("costo_unitario", { precision: 12, scale: 2 }).notNull().default("0"),
  stockMinimo: numeric("stock_minimo", { precision: 12, scale: 2 }).notNull().default("0"),
  precioVenta: numeric("precio_venta", { precision: 12, scale: 2 }).notNull().default("0"),
  visibleCliente: boolean("visible_cliente").notNull().default(false),
  descripcion: text("descripcion"),
  fotoUrl: text("foto_url"),
  activo: boolean("activo").notNull().default(true),
  ...timestamps,
}, (table) => ({
  negocioSkuUnq: unique().on(table.negocioId, table.sku),
}));

export const movInventario = pgTable("mov_inventario", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  inventarioId: uuid("inventario_id").notNull().references(() => inventario.id),
  tipo: tipoMovInventario("tipo").notNull(),
  cantidad: numeric("cantidad", { precision: 12, scale: 2 }).notNull(),
  motivo: text("motivo").notNull(),
  citaId: uuid("cita_id").references(() => citas.id, { onDelete: "set null" }),
  fecha: timestamp("fecha", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  ...timestamps,
});

export const servicioInsumos = pgTable("servicio_insumos", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  servicioId: uuid("servicio_id").notNull().references(() => servicios.id, { onDelete: "cascade" }),
  inventarioId: uuid("inventario_id").notNull().references(() => inventario.id),
  cantidad: numeric("cantidad", { precision: 12, scale: 2 }).notNull(),
  ...timestamps,
}, (table) => ({
  servicioInventarioUnq: unique().on(table.servicioId, table.inventarioId),
}));

export const citaHistorial = pgTable("cita_historial", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  citaId: uuid("cita_id").notNull().references(() => citas.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => usuarios.id, { onDelete: "set null" }),
  actorRol: rolUsuario("actor_rol"),
  estadoAnterior: estadoCita("estado_anterior"),
  estadoNuevo: estadoCita("estado_nuevo"),
  accion: text("accion").notNull(),
  detalle: text("detalle"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
  accion: text("accion").notNull(),
  detalle: json("detalle").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

// ── Depósitos / anticipos (tatuajes y servicios de larga duración) ─────────
export const estadoDeposito = pgEnum("estado_deposito", ["recibido", "aplicado", "devuelto"]);

export const depositos = pgTable("depositos", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  citaId: uuid("cita_id").notNull().references(() => citas.id, { onDelete: "cascade" }),
  clienteId: uuid("cliente_id").notNull().references(() => clientes.id),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  metodoPago: metodoPago("metodo_pago").notNull(),
  estado: estadoDeposito("estado").notNull().default("recibido"),
  comprobanteUrl: text("comprobante_url"),
  notas: text("notas"),
  ...timestamps,
});

// ── Book / historial de diseños por cliente ───────────────────────────────
export const tipoArchivoCliente = pgEnum("tipo_archivo_cliente", ["boceto", "referencia", "resultado", "otro"]);

export const clienteArchivos = pgTable("cliente_archivos", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").references(() => negocios.id, { onDelete: "restrict" }),
  clienteId: uuid("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  citaId: uuid("cita_id").references(() => citas.id, { onDelete: "set null" }),
  tipo: tipoArchivoCliente("tipo").notNull().default("otro"),
  url: text("url").notNull(),
  storagePath: text("storage_path"),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  createdBy: uuid("created_by").references(() => usuarios.id, { onDelete: "set null" }),
  ...timestamps,
});

export const impersonationTokens = pgTable("impersonation_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  negocioId: uuid("negocio_id").notNull().references(() => negocios.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
