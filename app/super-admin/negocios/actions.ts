"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios, usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { negocioSchema, negocioUpdateSchema } from "@/lib/validations/admin";

export async function createNegocio(formData: FormData) {
  await requireRole(["super_admin"]);
  const payload = negocioSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const supabase = createSupabaseAdminClient();

  const [negocio] = await db.insert(negocios).values({
    nombre: payload.nombre.trim(),
    slug: payload.slug.trim().toLowerCase(),
    telefono: payload.telefono || null,
    direccion: payload.direccion || null,
    logoUrl: payload.logoUrl || null,
    colorPrimario: payload.colorPrimario,
    colorSecundario: payload.colorSecundario,
    colorAcento: payload.colorAcento,
    fuente: payload.fuente,
    plan: payload.plan,
    estado: payload.estado,
    modoAislamiento: payload.modoAislamiento,
    fechaInicio: new Date().toISOString().slice(0, 10),
  }).returning({ id: negocios.id });

  const { data, error } = await supabase.auth.admin.createUser({
    email: payload.adminEmail.trim().toLowerCase(),
    password: payload.adminPassword,
    email_confirm: true,
    app_metadata: { rol: "admin", role: "admin", negocio_id: negocio.id },
    user_metadata: {
      rol: "admin",
      negocio_id: negocio.id,
      nombre: payload.adminNombre.trim(),
      telefono: payload.adminTelefono.trim(),
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "No se pudo crear el admin del negocio");
  }

  await db.insert(usuarios).values({
    id: data.user.id,
    negocioId: negocio.id,
    email: payload.adminEmail.trim().toLowerCase(),
    rol: "admin",
    nombre: payload.adminNombre.trim(),
    telefono: payload.adminTelefono.trim(),
    activo: true,
  });

  revalidatePath("/super-admin/negocios");
}

export async function updateNegocio(formData: FormData) {
  await requireRole(["super_admin"]);
  const payload = negocioUpdateSchema.parse(Object.fromEntries(formData));

  await getDb().update(negocios).set({
    nombre: payload.nombre.trim(),
    slug: payload.slug.trim().toLowerCase(),
    telefono: payload.telefono || null,
    direccion: payload.direccion || null,
    logoUrl: payload.logoUrl || null,
    colorPrimario: payload.colorPrimario,
    colorSecundario: payload.colorSecundario,
    colorAcento: payload.colorAcento,
    fuente: payload.fuente,
    plan: payload.plan,
    estado: payload.estado,
    modoAislamiento: payload.modoAislamiento,
    updatedAt: new Date(),
  }).where(eq(negocios.id, payload.id));

  revalidatePath("/super-admin/negocios");
  revalidatePath(`/super-admin/negocios/${payload.id}`);
}
