"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { clientes, empleados, negocios, usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { negocioSchema, negocioUpdateSchema, negocioUserSchema } from "@/lib/validations/admin";

export async function createNegocio(formData: FormData) {
  await requireRole(["super_admin"]);
  const payload = negocioSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const supabase = createSupabaseAdminClient();

  const [negocio] = await db.insert(negocios).values({
    nombre: payload.nombre.trim(),
    slug: payload.slug.trim().toLowerCase(),
    telefono: payload.telefono || null,
    correo: payload.correo || null,
    direccion: payload.direccion || null,
    representante: payload.representante || null,
    tipoDocumento: payload.tipoDocumento || null,
    numeroDocumento: payload.numeroDocumento || null,
    ciudadIndicativo: payload.ciudadIndicativo || null,
    contactoPrincipal: payload.contactoPrincipal || null,
    descripcion: payload.descripcion || null,
    slogan: payload.slogan || payload.descripcion?.slice(0, 150) || null,
    logoUrl: payload.logoUrl || null,
    colorPrimario: payload.colorPrimario,
    colorSecundario: payload.colorSecundario,
    colorAcento: payload.colorAcento,
    fuente: payload.fuente,
    plan: payload.plan,
    estado: payload.estado,
    modoAislamiento: payload.modoAislamiento,
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: payload.fechaFin || renewalDate(30),
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
    correo: payload.correo || null,
    direccion: payload.direccion || null,
    representante: payload.representante || null,
    tipoDocumento: payload.tipoDocumento || null,
    numeroDocumento: payload.numeroDocumento || null,
    ciudadIndicativo: payload.ciudadIndicativo || null,
    contactoPrincipal: payload.contactoPrincipal || null,
    descripcion: payload.descripcion || null,
    slogan: payload.slogan || payload.descripcion?.slice(0, 150) || null,
    logoUrl: payload.logoUrl || null,
    colorPrimario: payload.colorPrimario,
    colorSecundario: payload.colorSecundario,
    colorAcento: payload.colorAcento,
    fuente: payload.fuente,
    plan: payload.plan,
    estado: payload.estado,
    modoAislamiento: payload.modoAislamiento,
    fechaFin: payload.fechaFin || null,
    updatedAt: new Date(),
  }).where(eq(negocios.id, payload.id));

  revalidatePath("/super-admin/negocios");
  revalidatePath(`/super-admin/negocios/${payload.id}`);
}

function renewalDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function toggleNegocio(formData: FormData) {
  await requireRole(["super_admin"]);
  const id = String(formData.get("id") || "");
  const nextEstado = String(formData.get("estado") || "");
  if (!id || !["activo", "suspendido", "cancelado"].includes(nextEstado)) {
    throw new Error("Estado invalido");
  }

  const active = nextEstado === "activo";
  await getDb().update(negocios).set({
    estado: nextEstado,
    updatedAt: new Date(),
  }).where(eq(negocios.id, id));

  await getDb().update(usuarios).set({
    activo: active,
    updatedAt: new Date(),
  }).where(eq(usuarios.negocioId, id));

  revalidatePath("/super-admin/negocios");
  revalidatePath(`/super-admin/negocios/${id}`);
}

export async function createNegocioUser(formData: FormData) {
  await requireRole(["super_admin"]);
  const payload = negocioUserSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const supabase = createSupabaseAdminClient();
  const email = payload.email.trim().toLowerCase();

  if (payload.rol === "empleado" && !payload.especialidad) {
    throw new Error("Especialidad requerida para empleado");
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    app_metadata: { rol: payload.rol, role: payload.rol, negocio_id: payload.negocioId },
    user_metadata: {
      rol: payload.rol,
      negocio_id: payload.negocioId,
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "No se pudo crear el usuario");
  }

  await db.insert(usuarios).values({
    id: data.user.id,
    negocioId: payload.negocioId,
    email,
    rol: payload.rol,
    nombre: payload.nombre.trim(),
    telefono: payload.telefono.trim(),
    activo: true,
  });

  if (payload.rol === "empleado") {
    await db.insert(empleados).values({
      negocioId: payload.negocioId,
      usuarioId: data.user.id,
      especialidad: payload.especialidad as "barberia" | "peluqueria" | "spa_unas" | "tatuajes",
      comisionPct: String(payload.comisionPct ?? 0),
      activo: true,
    });
  }

  if (payload.rol === "cliente") {
    await db.insert(clientes).values({
      negocioId: payload.negocioId,
      usuarioId: data.user.id,
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
      email,
    });
  }

  revalidatePath("/super-admin/negocios");
  revalidatePath(`/super-admin/negocios/${payload.negocioId}`);
}
