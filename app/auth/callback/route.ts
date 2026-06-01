import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, roleHome } from "@/lib/auth/roles";
import { getDb } from "@/lib/db";
import { clientes, negocios, usuarios } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) {
      const db = getDb();
      const [profile] = await db.select({ id: usuarios.id, rol: usuarios.rol }).from(usuarios).where(eq(usuarios.id, user.id)).limit(1);
      if (!profile) {
        const [negocio] = await db.select({ id: negocios.id }).from(negocios).where(eq(negocios.slug, "barberlab-demo")).limit(1);
        if (negocio) {
          await db.insert(usuarios).values({
            id: user.id,
            negocioId: negocio.id,
            email: user.email || "",
            rol: "cliente",
            nombre: user.user_metadata?.full_name || user.email || "Cliente",
            telefono: user.user_metadata?.phone || null,
            activo: true,
          });
          await db.insert(clientes).values({
            negocioId: negocio.id,
            usuarioId: user.id,
            nombre: user.user_metadata?.full_name || user.email || "Cliente",
            telefono: user.user_metadata?.phone || "0000000000",
            email: user.email || null,
          });
        }
      }
    }

    const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
    const role = getRoleFromClaims(data.user?.app_metadata) ?? getRoleFromClaims(data.user?.user_metadata) ?? "cliente";
    if (role) {
      return NextResponse.redirect(new URL(safeNext || roleHome[role], request.url));
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
