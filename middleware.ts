import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRoleFromClaims, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { DEMO_COOKIE, getDemoRoleFromToken, isDemoDeployment } from "@/lib/demo";

export async function middleware(request: NextRequest) {
  const demoRole = await getDemoRoleFromToken(request.cookies.get(DEMO_COOKIE)?.value);
  const pathname = request.nextUrl.pathname;
  const matched = protectedPrefixes.find((item) => pathname.startsWith(item.prefix));

  if (demoRole) {
    if (!matched) {
      if (pathname === "/login") {
        return NextResponse.redirect(new URL(roleHome[demoRole], request.url));
      }
      return NextResponse.next({ request });
    }
    if (matched.roles.includes(demoRole)) {
      return NextResponse.next({ request });
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isDemoDeployment()) {
    if (!matched) return NextResponse.next({ request });
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

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const isPublicRoute = pathname.startsWith("/login") || pathname.startsWith("/api/auth");
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata);

  if (!matched) {
    if (pathname === "/login" && role) {
      return NextResponse.redirect(new URL(roleHome[role], request.url));
    }
    return supabaseResponse;
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
