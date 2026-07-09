CREATE TABLE "puntos_movimientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid,
	"cliente_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"motivo" text NOT NULL,
	"cita_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "cumpleanos" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "puntos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "acepta_comunicaciones" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "negocios" ADD COLUMN "settings" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "puntos_movimientos" ADD CONSTRAINT "puntos_movimientos_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_movimientos" ADD CONSTRAINT "puntos_movimientos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_movimientos" ADD CONSTRAINT "puntos_movimientos_cita_id_citas_id_fk" FOREIGN KEY ("cita_id") REFERENCES "public"."citas"("id") ON DELETE set null ON UPDATE no action;