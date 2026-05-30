import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRoleFromClaims, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";

export async function middleware(request: NextRequest) {
  const demoRole = request.cookies.get("barberlab_demo_role")?.value;

  // DEBUG temporal — ver en Vercel Function Logs
  console.log("[mw] cookies:", request.cookies.getAll().map((c) => c.name));
  console.log("[mw] SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("[mw] ANON_KEY:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  // DEBUG temporal
  console.log("[mw] getUser error:", getUserError?.message ?? null);
  console.log("[mw] user id:", user?.id ?? null);

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
    return supabaseResponse;
  }

  if (isDemoMode() && demoRole === "admin" && matched.roles.includes("admin")) {
    return supabaseResponse;
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

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/super-admin/:path*",
    "/empleado/:path*",
    "/cliente/:path*",
    "/perfil",
  ],
};
