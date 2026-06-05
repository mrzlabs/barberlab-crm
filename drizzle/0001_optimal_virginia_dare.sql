CREATE TYPE "public"."estado_deposito" AS ENUM('recibido', 'aplicado', 'devuelto');--> statement-breakpoint
CREATE TYPE "public"."tipo_archivo_cliente" AS ENUM('boceto', 'referencia', 'resultado', 'otro');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"usuario_id" uuid,
	"accion" text NOT NULL,
	"detalle" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cliente_archivos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"cliente_id" uuid NOT NULL,
	"cita_id" uuid,
	"tipo" "tipo_archivo_cliente" DEFAULT 'otro' NOT NULL,
	"url" text NOT NULL,
	"storage_path" text,
	"nombre" text NOT NULL,
	"descripcion" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "depositos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"cita_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"metodo_pago" "metodo_pago" NOT NULL,
	"estado" "estado_deposito" DEFAULT 'recibido' NOT NULL,
	"comprobante_url" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impersonation_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "impersonation_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "inventario" ADD COLUMN "descripcion" text;--> statement-breakpoint
ALTER TABLE "inventario" ADD COLUMN "foto_url" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente_archivos" ADD CONSTRAINT "cliente_archivos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente_archivos" ADD CONSTRAINT "cliente_archivos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente_archivos" ADD CONSTRAINT "cliente_archivos_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente_archivos" ADD CONSTRAINT "cliente_archivos_created_by_usuarios_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "depositos" ADD CONSTRAINT "depositos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "depositos" ADD CONSTRAINT "depositos_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "depositos" ADD CONSTRAINT "depositos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impersonation_tokens" ADD CONSTRAINT "impersonation_tokens_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impersonation_tokens" ADD CONSTRAINT "impersonation_tokens_created_by_usuarios_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;