import { NextResponse, type NextRequest } from "next/server";
import { getRoleFromClaims, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const demoRole = request.cookies.get("barberlab_demo_role")?.value;
  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const matched = protectedPrefixes.find((item) => pathname.startsWith(item.prefix));

  if (!matched) {
    if (isDemoMode() && pathname === "/login" && demoRole === "admin") {
      return NextResponse.redirect(new URL(roleHome.admin, request.url));
    }
    if (pathname === "/login" && user) {
      const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata);
      if (role) return NextResponse.redirect(new URL(roleHome[role], request.url));
    }
    return response;
  }

  if (isDemoMode() && demoRole === "admin" && matched.roles.includes("admin")) {
    return response;
  }

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata);
  if (!role || !matched.roles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/empleado/:path*",
    "/cliente/:path*",
  ],
};
