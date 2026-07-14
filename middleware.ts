import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRoleFromClaims, isRole, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";

export async function middleware(request: NextRequest) {
  // Única fuente de verdad del modo demo: isDemoMode(). La sesión, las queries
  // y las actions usan la misma función; si el middleware la contradice, el
  // login demo entra en bucle de redirección (bug en despliegues de demo).
  const effectiveDemoMode = isDemoMode();

  const demoRole = request.cookies.get("barberlab_demo_role")?.value;
  const pathname = request.nextUrl.pathname;
  const matched = protectedPrefixes.find((item) => pathname.startsWith(item.prefix));

  if (effectiveDemoMode) {
    if (!matched) {
      if (pathname === "/login" && isRole(demoRole)) {
        return NextResponse.redirect(new URL(roleHome[demoRole], request.url));
      }
      return NextResponse.next({ request });
    }
    if (isRole(demoRole) && matched.roles.includes(demoRole)) {
      return NextResponse.next({ request });
    }
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const isPublicRoute = pathname.startsWith("/login") || pathname.startsWith("/api/auth");
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  const role = user
    ? getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata)
    : null;

  if (!matched) {
    if (pathname === "/login" && user && role) {
      return NextResponse.redirect(new URL(roleHome[role], request.url));
    }
    return supabaseResponse;
  }

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    url.searchParams.set("error", "profile");
    return NextResponse.redirect(url);
  }

  if (!matched.roles.includes(role)) {
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
