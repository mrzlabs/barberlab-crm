/**
 * Crea el usuario empleado@smartstyle.co en Supabase Auth + tabla usuarios.
 * Uso: node scripts/seed-empleado.mjs
 */

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv();

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL      = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error("Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL     = "empleado@smartstyle.co";
const PASSWORD  = "SmartStyle2026!";
const NEGOCIO_ID = "b2383f3b-43df-4967-a744-699116ff59fc";

console.log(`\n[seed-empleado] Creando ${EMAIL}...`);

// 1. Crear en Supabase Auth
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
  app_metadata: { role: "empleado" },
  user_metadata: { role: "empleado", nombre: "Empleado SmartStyle" },
});

if (authError && !authError.message.includes("already been registered")) {
  console.error("[seed-empleado] Error en Auth:", authError.message);
  process.exit(1);
}

const userId = authData?.user?.id;
if (!userId) {
  // Si ya existe, obtener el ID
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === EMAIL);
  if (!found) { console.error("No se pudo obtener el user ID"); process.exit(1); }
  console.log("[seed-empleado] Usuario ya existe en Auth con ID:", found.id);
  await seedDb(found.id);
} else {
  console.log("[seed-empleado] Usuario creado en Auth con ID:", userId);
  await seedDb(userId);
}

async function seedDb(uid) {
  const sql = postgres(DATABASE_URL, { prepare: false });

  try {
    // Insertar en usuarios (upsert seguro)
    await sql`
      INSERT INTO usuarios (id, negocio_id, email, rol, nombre, activo, super_admin, must_change_password, created_at, updated_at)
      VALUES (
        ${uid}::uuid,
        ${NEGOCIO_ID}::uuid,
        ${EMAIL},
        'empleado',
        'Empleado SmartStyle',
        true,
        false,
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        negocio_id = EXCLUDED.negocio_id,
        rol        = EXCLUDED.rol,
        activo     = EXCLUDED.activo,
        updated_at = NOW()
    `;

    // Crear registro en empleados si no existe
    await sql`
      INSERT INTO empleados (id, negocio_id, usuario_id, especialidad, comision_pct, activo, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${NEGOCIO_ID}::uuid,
        ${uid}::uuid,
        'barberia',
        '30',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (usuario_id) DO NOTHING
    `;

    console.log("[seed-empleado] Registro en DB creado/actualizado correctamente.");
    console.log("\n✓ empleado@smartstyle.co listo");
    console.log("  Negocio ID:", NEGOCIO_ID);
    console.log("  Password:  SmartStyle2026!");
    console.log("  Rol:       empleado\n");
  } finally {
    await sql.end();
  }
}
