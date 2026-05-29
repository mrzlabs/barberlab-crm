import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";

export async function getNegocios() {
  return getDb().select().from(negocios).orderBy(desc(negocios.createdAt)).limit(100);
}
