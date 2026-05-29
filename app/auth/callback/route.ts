import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, roleHome } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data } = await supabase.auth.getUser();
    const role = getRoleFromClaims(data.user?.app_metadata) ?? getRoleFromClaims(data.user?.user_metadata);
    if (role) {
      return NextResponse.redirect(new URL(next || roleHome[role], request.url));
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
