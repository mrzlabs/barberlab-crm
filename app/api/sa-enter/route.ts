import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { impersonationTokens } from "@/lib/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const tok = request.nextUrl.searchParams.get("tok");
  if (!tok) {
    return NextResponse.redirect(new URL("/login?error=token_missing", request.url));
  }

  const db = getDb();
  const now = new Date();

  // Atomic validate + mark used in one UPDATE … RETURNING to eliminate TOCTOU race condition
  const [used] = await db
    .update(impersonationTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(impersonationTokens.token, tok),
        gt(impersonationTokens.expiresAt, now),
        isNull(impersonationTokens.usedAt),
      ),
    )
    .returning({ id: impersonationTokens.id, negocioId: impersonationTokens.negocioId });

  if (!used) {
    return NextResponse.redirect(new URL("/login?error=token_invalid", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  response.cookies.set("barberlab_sa_imp", used.negocioId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });
  return response;
}
