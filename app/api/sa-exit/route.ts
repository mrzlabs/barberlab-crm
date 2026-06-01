import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const [profile] = await getDb()
    .select({ superAdmin: usuarios.superAdmin })
    .from(usuarios)
    .where(eq(usuarios.id, user.id))
    .limit(1);

  if (!profile?.superAdmin) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const response = NextResponse.redirect(new URL("/super-admin/negocios", request.url));
  response.cookies.delete("barberlab_sa_imp");
  return response;
}
