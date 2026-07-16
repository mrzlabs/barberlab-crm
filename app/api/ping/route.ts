import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isDemoMode } from "@/lib/demo-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (await isDemoMode()) return NextResponse.json({ ok: true, demo: true });
  const db = getDb();
  await db.execute(sql`SELECT 1`);
  return NextResponse.json({ ok: true });
}
