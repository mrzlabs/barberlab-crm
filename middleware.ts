import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRoleFromClaims, isRole, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";

export async function middleware(request: NextRequest) {
  const effectiveDemoMode = isDemoMode() && !(process.env.BARBERLAB_DEMO_MODE === "true" && process.env.NODE_ENV === "production");

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

  // Use getSession (cookie-only, no network) for routing decisions.
  // Page Server Components call getUser() for actual data security.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

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

  // Verify negocio is active — gate behind timeout to avoid MIDDLEWARE_INVOCATION_TIMEOUT.
  if (role !== "super_admin") {
    try {
      const tenantQuery = supabase
        .from("usuarios")
        .select("negocios(estado)")
        .eq("id", user.id)
        .maybeSingle();

      const { data: tenantRow } = await Promise.race([
        tenantQuery,
        new Promise<{ data: null }>((resolve) => setTimeout(() => resolve({ data: null }), 1200)),
      ]);

      const negocioEstado =
        Array.isArray(tenantRow?.negocios)
          ? (tenantRow.negocios[0] as { estado?: string } | undefined)?.estado
          : (tenantRow?.negocios as unknown as { estado?: string } | null)?.estado;

      if (negocioEstado && negocioEstado !== "activo") {
        const url = new URL("/login", request.url);
        url.searchParams.set("error", "negocio_inactivo");
        return NextResponse.redirect(url);
      }
    } catch {
      // If the tenant check times out, allow the request through.
      // Server components will enforce auth independently via requireRole().
    }
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
