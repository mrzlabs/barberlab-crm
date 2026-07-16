"use server";

import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo-server";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function assignPlan(slug: string, plan: string) {
  await requireRole(["super_admin"]);
  if (await isDemoMode()) {
    revalidatePath("/super-admin/planes");
    revalidatePath("/super-admin/negocios");
    return;
  }
  const db = getDb();
  const [negocio] = await db.select({ id: negocios.id }).from(negocios).where(eq(negocios.slug, slug)).limit(1);
  if (!negocio) throw new Error(`No se encontró negocio con slug "${slug}"`);
  await db.update(negocios).set({ plan }).where(eq(negocios.id, negocio.id));
  revalidatePath("/super-admin/planes");
  revalidatePath("/super-admin/negocios");
}
