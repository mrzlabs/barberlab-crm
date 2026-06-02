import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// OIDs de tipos temporales en PostgreSQL
// 1082 = date, 1114 = timestamp without tz, 1184 = timestamptz, 1266 = timetz
const DATE_OIDS = [1082, 1114, 1184, 1266];

function serializeDate(x: Date | string | unknown): string {
  if (x instanceof Date) return x.toISOString();
  return String(x);
}

const postgresTypes = {
  dates_as_string: {
    to: 1184,
    from: DATE_OIDS,
    // serialize: Date (from JS WHERE clauses) → ISO string for Postgres
    serialize: serializeDate,
    // parse: string from Postgres wire → string (never Date)
    parse: (x: string) => x,
  },
};

let cachedDb: PostgresJsDatabase<typeof schema> | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada");

  const client = postgres(url, {
    prepare: false,        // required for Supabase connection pooling (pgBouncer)
    max: 3,                // small pool for serverless
    idle_timeout: 20,      // close idle before pgBouncer's 30s timeout
    connect_timeout: 10,
    max_lifetime: 60 * 10,
    types: postgresTypes,  // force all date/timestamp fields to return as strings
  });

  cachedDb = drizzle(client, { schema });
  return cachedDb;
}
