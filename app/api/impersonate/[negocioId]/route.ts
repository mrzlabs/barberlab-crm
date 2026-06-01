import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { impersonationTokens, usuarios } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: { negocioId: string } },
) {
  // 1. Verify requester is super_admin via active session
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [requester] = await getDb()
    .select({ superAdmin: usuarios.superAdmin, id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.id, user.id))
    .limit(1);

  if (!requester?.superAdmin) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { negocioId } = params;

  // 2. Verify negocio has an active admin
  const [adminUser] = await getDb()
    .select({ id: usuarios.id })
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

  // 3. Create single-use token valid for 2 hours
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await getDb().insert(impersonationTokens).values({
    negocioId,
    createdBy: requester.id,
    token,
    expiresAt,
  });

  // Use the Host header so the URL matches the origin the browser used
  // (request.nextUrl.origin normalises to "localhost" internally in Next.js dev)
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host  = request.headers.get("host") ?? request.nextUrl.host;
  const origin = `${proto}://${host}`;
  return NextResponse.json({ url: `${origin}/api/sa-enter?tok=${token}` });
}
