import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRoleFromClaims, getRoleFromProfile, protectedPrefixes, roleHome } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo";

export async function middleware(request: NextRequest) {
  const demoRole = request.cookies.get("barberlab_demo_role")?.value;

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

  const pathname = request.nextUrl.pathname;
  const matched = protectedPrefixes.find((item) => pathname.startsWith(item.prefix));
  const session = user ? await getSessionAccess(supabase, user) : null;

  if (!matched) {
    if (isDemoMode() && pathname === "/login" && demoRole === "admin") {
      return NextResponse.redirect(new URL(roleHome.admin, request.url));
    }
    if (pathname === "/login" && user) {
      if (session?.role) return NextResponse.redirect(new URL(roleHome[session.role], request.url));
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

  if (!session?.role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    url.searchParams.set("error", "profile");
    return NextResponse.redirect(url);
  }

  if (!session.active) {
    return NextResponse.redirect(new URL("/unauthorized?reason=inactive", request.url));
  }

  if (!matched.roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return supabaseResponse;
}

async function getSessionAccess(supabase: ReturnType<typeof createServerClient>, user: { id: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown> }) {
  const { data: profile } = await supabase
    .from("usuarios")
    .select("rol,super_admin,activo,negocios(estado)")
    .eq("id", user.id)
    .maybeSingle();

  const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata) ?? getRoleFromProfile(profile);
  const negocio = Array.isArray(profile?.negocios) ? profile?.negocios[0] : profile?.negocios;
  const negocioActivo = role === "super_admin" || !negocio || negocio.estado === "activo";

  return {
    role,
    active: Boolean(profile?.activo) && negocioActivo,
  };
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
