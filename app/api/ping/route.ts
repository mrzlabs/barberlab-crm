import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  await db.execute(sql`SELECT 1`);
  return NextResponse.json({ ok: true });
}
