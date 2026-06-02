import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let cachedDb: PostgresJsDatabase<typeof schema> | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada");

  const client = postgres(url, {
    prepare: false,       // required for Supabase connection pooling (pgBouncer)
    max: 3,               // small pool for serverless — avoids exhausting pooler slots
    idle_timeout: 20,     // close idle connections after 20s (before pgBouncer's 30s timeout)
    connect_timeout: 10,  // fail fast instead of hanging
    max_lifetime: 60 * 10, // recycle connections every 10 min
  });

  cachedDb = drizzle(client, { schema });
  return cachedDb;
}
