import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRoleFromClaims, isRole, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";

export async function middleware(request: NextRequest) {
  // Safety: demo mode must never run in production
  if (process.env.BARBERLAB_DEMO_MODE === "true" && process.env.NODE_ENV === "production") {
    // Cannot mutate env at runtime; block demo paths and treat as non-demo
  }
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
  } = await supabase.auth.getUser();

  const role = user ? getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata) : null;

  if (!matched) {
    if (pathname === "/login" && user) {
      if (role) return NextResponse.redirect(new URL(roleHome[role], request.url));
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

  // Verify negocio is active for non-super-admin users accessing tenant routes.
  // Uses Supabase REST (edge-compatible) since Drizzle cannot run in Edge Runtime.
  if (role !== "super_admin") {
    const { data: tenantRow } = await supabase
      .from("usuarios")
      .select("negocios(estado)")
      .eq("id", user.id)
      .maybeSingle();

    const negocioEstado =
      // PostgREST returns the related row as object or array depending on cardinality
      Array.isArray(tenantRow?.negocios)
        ? (tenantRow.negocios[0] as { estado?: string } | undefined)?.estado
        : (tenantRow?.negocios as unknown as { estado?: string } | null)?.estado;

    if (negocioEstado && negocioEstado !== "activo") {
      const url = new URL("/login", request.url);
      url.searchParams.set("error", "negocio_inactivo");
      return NextResponse.redirect(url);
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

