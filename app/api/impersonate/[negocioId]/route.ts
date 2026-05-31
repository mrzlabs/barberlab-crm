import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { negocioId: string } },
) {
  // 1. Verify the requester is a super_admin via their active session
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [requester] = await getDb()
    .select({ superAdmin: usuarios.superAdmin })
    .from(usuarios)
    .where(eq(usuarios.id, user.id))
    .limit(1);

  if (!requester?.superAdmin) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { negocioId } = params;

  // 2. Find the active admin user for the target negocio
  const [adminUser] = await getDb()
    .select({ email: usuarios.email })
    .from(usuarios)
    .where(
      and(
        eq(usuarios.negocioId, negocioId),
        eq(usuarios.rol, "admin"),
        eq(usuarios.activo, true),
      ),
    )
    .limit(1);

  if (!adminUser) {
    return NextResponse.json(
      { error: "No se encontró un admin activo para este negocio" },
      { status: 404 },
    );
  }

  // 3. Generate a one-time magic link using the service role key.
  //    The link authenticates as the negocio's admin and redirects to their dashboard.
  //    Note: loading this link in an iframe will replace the browser's active session.
  const admin = createSupabaseAdminClient();
  const origin = request.nextUrl.origin;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: adminUser.email,
    options: { redirectTo: `${origin}/auth/callback?next=/admin/dashboard` },
  });

  if (error || !data?.properties?.action_link) {
    return NextResponse.json(
      { error: error?.message ?? "Error al generar el acceso temporal" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: data.properties.action_link });
}
