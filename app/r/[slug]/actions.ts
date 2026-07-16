"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { clientes, negocios } from "@/lib/db/schema";
import { getPuntosConfig, moverPuntos } from "@/lib/puntos";
import { isDemoMode } from "@/lib/demo-server";

const registroSchema = z.object({
  slug: z.string().min(2).max(80),
  nombre: z.string().min(2).max(120),
  telefono: z.string().min(7).max(20),
  email: z.string().email().max(160).optional().or(z.literal("")),
  cumpleanos: z.string().max(10).optional().or(z.literal("")),
  consentimiento: z.string().optional(),
});

export async function registrarClientePublico(formData: FormData) {
  const parsed = registroSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/r/${formData.get("slug")}?error=datos`);
  const data = parsed.data;

  if (await isDemoMode()) redirect(`/r/${data.slug}?ok=1`);

  const db = getDb();
  const [negocio] = await db
    .select({ id: negocios.id, estado: negocios.estado, settings: negocios.settings })
    .from(negocios)
    .where(eq(negocios.slug, data.slug))
    .limit(1);
  if (!negocio || negocio.estado !== "activo") redirect(`/r/${data.slug}?error=negocio`);

  const consentimientoObligatorio = negocio.settings?.politicas?.consentimientoObligatorio ?? true;
  if (consentimientoObligatorio && data.consentimiento !== "on") {
    redirect(`/r/${data.slug}?error=consentimiento`);
  }

  const telefono = data.telefono.replace(/[^\d+]/g, "");
  const cumpleanos = /^\d{4}-\d{2}-\d{2}$/.test(data.cumpleanos ?? "") ? data.cumpleanos : null;

  // Dedupe por (negocio, teléfono): si existe, actualiza datos sin duplicar
  const [existente] = await db
    .select({ id: clientes.id })
    .from(clientes)
    .where(and(eq(clientes.negocioId, negocio.id), eq(clientes.telefono, telefono)))
    .limit(1);

  if (existente) {
    await db
      .update(clientes)
      .set({
        nombre: data.nombre.trim(),
        email: data.email || null,
        cumpleanos,
        aceptaComunicaciones: data.consentimiento === "on",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clientes.id, existente.id));
    redirect(`/r/${data.slug}?ok=existente`);
  }

  const [nuevo] = await db
    .insert(clientes)
    .values({
      negocioId: negocio.id,
      nombre: data.nombre.trim(),
      telefono,
      email: data.email || null,
      cumpleanos,
      aceptaComunicaciones: data.consentimiento === "on",
      notas: "Registro desde página pública",
    })
    .returning({ id: clientes.id });

  const puntos = getPuntosConfig(negocio.settings);
  if (nuevo && puntos.habilitado && puntos.bonoRegistro > 0) {
    await moverPuntos({
      negocioId: negocio.id,
      clienteId: nuevo.id,
      delta: puntos.bonoRegistro,
      motivo: "Bono de bienvenida · registro público",
    });
  }

  redirect(`/r/${data.slug}?ok=1`);
}
