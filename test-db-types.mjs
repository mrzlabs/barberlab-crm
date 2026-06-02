import { loadLocalEnv } from "./scripts/load-env.mjs";
loadLocalEnv();
import postgres from "postgres";

const DATE_OIDS = [1082, 1114, 1184, 1266];

// Test sin custom types (baseline)
const sqlRaw = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

// Test con custom types (nuestro fix)
const sqlFixed = postgres(process.env.DATABASE_URL, {
  prepare: false, max: 1,
  types: {
    dates_as_string: {
      to: 1184,
      from: DATE_OIDS,
      serialize: (x) => x,
      parse: (x) => x,
    },
  },
});

console.log("=== Test 1: Sin types config ===");
const [raw] = await sqlRaw`SELECT NOW()::timestamptz as ts, CURRENT_DATE::date as d, NOW()::timestamp as t`;
console.log("ts tipo:", typeof raw.ts, raw.ts instanceof Date ? "DATE OBJETO" : "string: " + raw.ts);
console.log("d  tipo:", typeof raw.d,  raw.d instanceof Date  ? "DATE OBJETO" : "string: " + raw.d);
console.log("t  tipo:", typeof raw.t,  raw.t instanceof Date  ? "DATE OBJETO" : "string: " + raw.t);

console.log("\n=== Test 2: Con types config ===");
const [fixed] = await sqlFixed`SELECT NOW()::timestamptz as ts, CURRENT_DATE::date as d, NOW()::timestamp as t`;
console.log("ts tipo:", typeof fixed.ts, fixed.ts instanceof Date ? "DATE OBJETO" : "string: " + fixed.ts);
console.log("d  tipo:", typeof fixed.d,  fixed.d instanceof Date  ? "DATE OBJETO" : "string: " + fixed.d);
console.log("t  tipo:", typeof fixed.t,  fixed.t instanceof Date  ? "DATE OBJETO" : "string: " + fixed.t);

await sqlRaw.end();
await sqlFixed.end();
