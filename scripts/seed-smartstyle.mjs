import { createClient } from "@supabase/supabase-js";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv();

const NEGOCIO_ID = "b2383f3b-43df-4967-a744-699116ff59fc";
const PASSWORD = "SmartStyle2026!";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── helpers ────────────────────────────────────────────────────────────────

function ok(label) {
  console.log(`  ✓ ${label}`);
}

function fail(label, msg) {
  console.error(`  ✗ ${label}: ${msg}`);
  process.exit(1);
}

async function findAuthUserByEmail(email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page++;
  }
}

async function ensureAuthUser({ email, rol, nombre, telefono }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: { rol, role: rol, negocio_id: NEGOCIO_ID },
    user_metadata: { rol, negocio_id: NEGOCIO_ID, nombre, telefono },
  });

  if (!error) {
    ok(`Auth user creado: ${email}`);
    return data.user;
  }

  const alreadyExists =
    error.message.includes("already been registered") ||
    error.message.includes("already exists") ||
    error.status === 422;

  if (alreadyExists) {
    const existing = await findAuthUserByEmail(email);
    if (existing) {
      ok(`Auth user ya existe: ${email}`);
      return existing;
    }
  }

  fail(`Auth createUser ${email}`, error.message);
}

async function upsertUsuario({ id, email, rol, nombre, telefono }) {
  const { error } = await supabase.from("usuarios").upsert(
    {
      id,
      negocio_id: NEGOCIO_ID,
      email,
      rol,
      nombre,
      telefono,
      activo: true,
    },
    { onConflict: "id" }
  );
  if (error) fail(`upsert usuario ${email}`, error.message);
  ok(`Tabla usuarios: ${email} (${rol})`);
}

// ─── 1. verificar negocio ────────────────────────────────────────────────────

console.log("\n1. Verificando negocio SmartStyle...");

const { data: negocio, error: negocioError } = await supabase
  .from("negocios")
  .select("id, nombre, estado")
  .eq("id", NEGOCIO_ID)
  .single();

if (negocioError || !negocio) {
  fail("negocio", negocioError?.message ?? "No encontrado");
}
ok(`Negocio encontrado: ${negocio.nombre} (${negocio.estado})`);

// ─── 2. crear usuarios ───────────────────────────────────────────────────────

console.log("\n2. Creando usuarios...");

const adminUser = await ensureAuthUser({
  email: "admin@smartstyle.co",
  rol: "admin",
  nombre: "Admin SmartStyle",
  telefono: "3001000001",
});
await upsertUsuario({
  id: adminUser.id,
  email: "admin@smartstyle.co",
  rol: "admin",
  nombre: "Admin SmartStyle",
  telefono: "3001000001",
});

const empleadoUser = await ensureAuthUser({
  email: "empleado@smartstyle.co",
  rol: "empleado",
  nombre: "Carlos Barbero",
  telefono: "3001000002",
});
await upsertUsuario({
  id: empleadoUser.id,
  email: "empleado@smartstyle.co",
  rol: "empleado",
  nombre: "Carlos Barbero",
  telefono: "3001000002",
});

const clienteUser = await ensureAuthUser({
  email: "cliente@smartstyle.co",
  rol: "cliente",
  nombre: "Juan Cliente",
  telefono: "3001000003",
});
await upsertUsuario({
  id: clienteUser.id,
  email: "cliente@smartstyle.co",
  rol: "cliente",
  nombre: "Juan Cliente",
  telefono: "3001000003",
});

// ─── 3. servicios ────────────────────────────────────────────────────────────

console.log("\n3. Creando servicios...");

const { data: serviciosExistentes } = await supabase
  .from("servicios")
  .select("nombre")
  .eq("negocio_id", NEGOCIO_ID);

const nombresExistentes = new Set((serviciosExistentes ?? []).map((s) => s.nombre));

const serviciosData = [
  { nombre: "Corte clásico", precio: "25000", duracion_min: 30 },
  { nombre: "Corte + barba", precio: "40000", duracion_min: 45 },
];

for (const s of serviciosData) {
  if (nombresExistentes.has(s.nombre)) {
    ok(`Servicio ya existe: ${s.nombre}`);
    continue;
  }
  const { error } = await supabase.from("servicios").insert({
    negocio_id: NEGOCIO_ID,
    categoria: "barberia",
    nombre: s.nombre,
    duracion_min: s.duracion_min,
    precio: s.precio,
    costo_insumo: "0",
    activo: true,
  });
  if (error) fail(`servicio ${s.nombre}`, error.message);
  ok(`Servicio creado: ${s.nombre} ($${s.precio})`);
}

// ─── 4. empleado ─────────────────────────────────────────────────────────────

console.log("\n4. Creando registro empleado...");

const { data: empleadoExistente } = await supabase
  .from("empleados")
  .select("id")
  .eq("usuario_id", empleadoUser.id)
  .maybeSingle();

if (empleadoExistente) {
  ok(`Empleado ya existe para: ${empleadoUser.email}`);
} else {
  const { error } = await supabase.from("empleados").insert({
    negocio_id: NEGOCIO_ID,
    usuario_id: empleadoUser.id,
    especialidad: "barberia",
    comision_pct: "10",
    activo: true,
  });
  if (error) fail("empleado", error.message);
  ok(`Empleado creado: Carlos Barbero (10% comisión)`);
}

// ─── 5. cliente ──────────────────────────────────────────────────────────────

console.log("\n5. Creando registro cliente...");

const { data: clienteExistente } = await supabase
  .from("clientes")
  .select("id")
  .eq("usuario_id", clienteUser.id)
  .maybeSingle();

if (clienteExistente) {
  ok(`Cliente ya existe para: ${clienteUser.email}`);
} else {
  const { error } = await supabase.from("clientes").insert({
    negocio_id: NEGOCIO_ID,
    usuario_id: clienteUser.id,
    nombre: "Juan Cliente",
    telefono: "3001000003",
    email: "cliente@smartstyle.co",
  });
  if (error) fail("cliente", error.message);
  ok(`Cliente creado: Juan Cliente`);
}

// ─── resumen ─────────────────────────────────────────────────────────────────

console.log(`
════════════════════════════════════════════
  SEED SmartStyle completado
  Negocio ID: ${NEGOCIO_ID}
────────────────────────────────────────────
  admin@smartstyle.co     / SmartStyle2026!  (admin)
  empleado@smartstyle.co  / SmartStyle2026!  (empleado)
  cliente@smartstyle.co   / SmartStyle2026!  (cliente)
════════════════════════════════════════════
`);
