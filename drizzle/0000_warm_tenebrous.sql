CREATE TYPE "public"."categoria_gasto" AS ENUM('arriendo', 'servicios_publicos', 'nomina', 'insumos', 'marketing', 'otros');--> statement-breakpoint
CREATE TYPE "public"."categoria_servicio" AS ENUM('barberia', 'peluqueria', 'spa_unas', 'tatuajes');--> statement-breakpoint
CREATE TYPE "public"."especialidad_empleado" AS ENUM('barberia', 'peluqueria', 'spa_unas', 'tatuajes');--> statement-breakpoint
CREATE TYPE "public"."estado_cita" AS ENUM('reservada', 'confirmada', 'realizada', 'cancelada', 'no_asistio');--> statement-breakpoint
CREATE TYPE "public"."metodo_pago" AS ENUM('efectivo', 'transferencia', 'tarjeta');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('super_admin', 'admin', 'empleado', 'cliente');--> statement-breakpoint
CREATE TYPE "public"."tipo_mov_inventario" AS ENUM('entrada', 'salida', 'ajuste');--> statement-breakpoint
CREATE TABLE "bloqueos_empleado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"empleado_id" uuid NOT NULL,
	"fecha_inicio" timestamp with time zone NOT NULL,
	"fecha_fin" timestamp with time zone NOT NULL,
	"motivo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cita_historial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"cita_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_rol" "rol_usuario",
	"estado_anterior" "estado_cita",
	"estado_nuevo" "estado_cita",
	"accion" text NOT NULL,
	"detalle" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"cliente_id" uuid NOT NULL,
	"empleado_id" uuid NOT NULL,
	"servicio_id" uuid NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone NOT NULL,
	"estado" "estado_cita" DEFAULT 'reservada' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"usuario_id" uuid,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_usuario_id_unique" UNIQUE("usuario_id")
);
--> statement-breakpoint
CREATE TABLE "empleados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"usuario_id" uuid NOT NULL,
	"especialidad" "especialidad_empleado" NOT NULL,
	"comision_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empleados_usuario_id_unique" UNIQUE("usuario_id")
);
--> statement-breakpoint
CREATE TABLE "gastos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"categoria" "categoria_gasto" NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"fecha" date NOT NULL,
	"descripcion" text,
	"comprobante_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horarios_empleado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"empleado_id" uuid NOT NULL,
	"dia_semana" integer NOT NULL,
	"hora_inicio" time NOT NULL,
	"hora_fin" time NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"sku" text NOT NULL,
	"nombre" text NOT NULL,
	"categoria" text NOT NULL,
	"unidad" text NOT NULL,
	"stock" numeric(12, 2) DEFAULT '0' NOT NULL,
	"costo_unitario" numeric(12, 2) DEFAULT '0' NOT NULL,
	"stock_minimo" numeric(12, 2) DEFAULT '0' NOT NULL,
	"precio_venta" numeric(12, 2) DEFAULT '0' NOT NULL,
	"visible_cliente" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventario_negocio_id_sku_unique" UNIQUE("negocio_id","sku")
);
--> statement-breakpoint
CREATE TABLE "mov_inventario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"inventario_id" uuid NOT NULL,
	"tipo" "tipo_mov_inventario" NOT NULL,
	"cantidad" numeric(12, 2) NOT NULL,
	"motivo" text NOT NULL,
	"cita_id" uuid,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "negocios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"telefono" text,
	"correo" text,
	"direccion" text,
	"representante" text,
	"tipo_documento" text,
	"numero_documento" text,
	"ciudad_indicativo" text,
	"contacto_principal" text,
	"descripcion" text,
	"slogan" text,
	"logo_url" text,
	"color_primario" text DEFAULT '#111827' NOT NULL,
	"color_secundario" text DEFAULT '#22d3ee' NOT NULL,
	"color_acento" text DEFAULT '#7c3aed' NOT NULL,
	"fuente" text DEFAULT 'Inter' NOT NULL,
	"config_visual" json DEFAULT '{}'::json NOT NULL,
	"plan" text DEFAULT 'starter' NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"modo_aislamiento" text DEFAULT 'multi_tenant' NOT NULL,
	"comision_base" text DEFAULT 'precio_final' NOT NULL,
	"propina_en_comision" boolean DEFAULT false NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "negocios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "servicio_insumos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"servicio_id" uuid NOT NULL,
	"inventario_id" uuid NOT NULL,
	"cantidad" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "servicio_insumos_servicio_id_inventario_id_unique" UNIQUE("servicio_id","inventario_id")
);
--> statement-breakpoint
CREATE TABLE "servicios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"categoria" "categoria_servicio" NOT NULL,
	"nombre" text NOT NULL,
	"duracion_min" integer NOT NULL,
	"precio" numeric(12, 2) NOT NULL,
	"costo_insumo" numeric(12, 2) DEFAULT '0' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "turnos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"cita_id" uuid NOT NULL,
	"precio_final" numeric(12, 2) NOT NULL,
	"propina" numeric(12, 2) DEFAULT '0' NOT NULL,
	"metodo_pago" "metodo_pago" NOT NULL,
	"descuento" numeric(12, 2) DEFAULT '0' NOT NULL,
	"observaciones" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "turnos_cita_id_unique" UNIQUE("cita_id")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"negocio_id" uuid,
	"email" text NOT NULL,
	"rol" "rol_usuario" NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text,
	"super_admin" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bloqueos_empleado" ADD CONSTRAINT "bloqueos_empleado_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloqueos_empleado" ADD CONSTRAINT "bloqueos_empleado_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cita_historial" ADD CONSTRAINT "cita_historial_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cita_historial" ADD CONSTRAINT "cita_historial_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cita_historial" ADD CONSTRAINT "cita_historial_actor_id_usuarios_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horarios_empleado" ADD CONSTRAINT "horarios_empleado_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horarios_empleado" ADD CONSTRAINT "horarios_empleado_empleado_id_empleados_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mov_inventario" ADD CONSTRAINT "mov_inventario_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mov_inventario" ADD CONSTRAINT "mov_inventario_inventario_id_inventario_id_fk" FOREIGN KEY ("inventario_id") REFERENCES "public"."inventario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mov_inventario" ADD CONSTRAINT "mov_inventario_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicio_insumos" ADD CONSTRAINT "servicio_insumos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicio_insumos" ADD CONSTRAINT "servicio_insumos_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicio_insumos" ADD CONSTRAINT "servicio_insumos_inventario_id_inventario_id_fk" FOREIGN KEY ("inventario_id") REFERENCES "public"."inventario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;