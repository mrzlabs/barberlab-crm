"use server";

import { and, eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { clientes, negocios, usuarios } from "@/lib/db/schema";
import { getPuntosConfig, moverPuntos } from "@/lib/puntos";
import { isDemoMode } from "@/lib/demo-server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

const registroSchema = z.object({
  slug: z.string().min(2).max(80),
  nombre: z.string().min(2).max(120),
  telefono: z.string().min(7).max(20),
  email: z.string().trim().email().max(160),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
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
  const email = data.email.toLowerCase();
  const cumpleanos = /^\d{4}-\d{2}-\d{2}$/.test(data.cumpleanos ?? "") ? data.cumpleanos : null;

  const [existente] = await db
    .select({ id: clientes.id, usuarioId: clientes.usuarioId })
    .from(clientes)
    .where(and(
      eq(clientes.negocioId, negocio.id),
      or(eq(clientes.telefono, telefono), eq(clientes.email, email)),
    ))
    .limit(1);

  if (existente?.usuarioId) {
    // Ya tiene cuenta en este negocio: actualizamos datos y lo enviamos a iniciar sesión.
    await db
      .update(clientes)
      .set({
        nombre: data.nombre.trim(),
        email,
        cumpleanos,
        aceptaComunicaciones: data.consentimiento === "on",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clientes.id, existente.id));
    redirect(`/r/${data.slug}?ok=cuenta&email=${encodeURIComponent(email)}`);
  }

  const supabase = createSupabaseAdminClient();

  // Modelo híbrido: el cliente define su clave aquí y entra directo; el correo queda para recuperación.
  const { data: creado, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    user_metadata: { rol: "cliente", negocio_id: negocio.id, nombre: data.nombre.trim(), telefono },
    app_metadata: { rol: "cliente", role: "cliente", negocio_id: negocio.id },
  });

  if (authError || !creado.user) {
    // Correo ya registrado en Auth: lo mandamos a iniciar sesión con el correo prellenado.
    const yaExiste = authError?.code === "email_exists" || /already|registered|exist/i.test(authError?.message ?? "");
    if (yaExiste) redirect(`/login?email=${encodeURIComponent(email)}&next=/cliente/reservar`);
    redirect(`/r/${data.slug}?error=cuenta`);
  }

  const userId = creado.user.id;

  let clienteId: string;
  try {
    clienteId = await db.transaction(async (tx) => {
      await tx.insert(usuarios).values({
        id: userId,
        negocioId: negocio.id,
        email,
        rol: "cliente",
        nombre: data.nombre.trim(),
        telefono,
        activo: true,
        mustChangePassword: false,
      });

      if (existente) {
        await tx.update(clientes).set({
          usuarioId: userId,
          nombre: data.nombre.trim(),
          telefono,
          email,
          cumpleanos,
          aceptaComunicaciones: data.consentimiento === "on",
          updatedAt: new Date().toISOString(),
        }).where(eq(clientes.id, existente.id));
        return existente.id;
      }

      const [nuevo] = await tx.insert(clientes).values({
        negocioId: negocio.id,
        usuarioId: userId,
        nombre: data.nombre.trim(),
        telefono,
        email,
        cumpleanos,
        aceptaComunicaciones: data.consentimiento === "on",
        notas: "Registro desde página pública",
      }).returning({ id: clientes.id });

      if (!nuevo) throw new Error("No se pudo crear el cliente");
      return nuevo.id;
    });
  } catch {
    await supabase.auth.admin.deleteUser(userId).catch(() => {});
    redirect(`/r/${data.slug}?error=cuenta`);
  }

  const puntos = getPuntosConfig(negocio.settings);
  if (!existente && puntos.habilitado && puntos.bonoRegistro > 0) {
    await moverPuntos({
      negocioId: negocio.id,
      clienteId,
      delta: puntos.bonoRegistro,
      motivo: "Bono de bienvenida · registro público",
    });
  }

  // Sesión automática: el cliente entra directo a su panel sin pasar por /login.
  const serverSupabase = createSupabaseServerClient();
  const { error: signInError } = await serverSupabase.auth.signInWithPassword({
    email,
    password: data.password,
  });
  if (signInError) redirect(`/login?email=${encodeURIComponent(email)}&next=/cliente/reservar`);

  redirect("/cliente/reservar");
}
