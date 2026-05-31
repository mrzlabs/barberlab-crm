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

  // Validate token: exists, not expired, not used
  const [record] = await db
    .select({ id: impersonationTokens.id, negocioId: impersonationTokens.negocioId })
    .from(impersonationTokens)
    .where(
      and(
        eq(impersonationTokens.token, tok),
        gt(impersonationTokens.expiresAt, now),
        isNull(impersonationTokens.usedAt),
      ),
    )
    .limit(1);

  if (!record) {
    return NextResponse.redirect(new URL("/login?error=token_invalid", request.url));
  }

  // Mark token as used (single-use)
  await db
    .update(impersonationTokens)
    .set({ usedAt: now })
    .where(eq(impersonationTokens.id, record.id));

  // Set impersonation cookie and redirect to admin dashboard
  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  response.cookies.set("barberlab_sa_imp", record.negocioId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });
  return response;
}
