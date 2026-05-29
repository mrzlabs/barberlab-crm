import { createClient } from "@supabase/supabase-js";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv();

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BARBERLAB_SUPER_ADMIN_EMAIL",
  "BARBERLAB_SUPER_ADMIN_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Falta variable ${key}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const email = process.env.BARBERLAB_SUPER_ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.BARBERLAB_SUPER_ADMIN_PASSWORD;
const nombre = process.env.BARBERLAB_SUPER_ADMIN_NOMBRE || "Super Admin BarberLab";
const telefono = process.env.BARBERLAB_SUPER_ADMIN_TELEFONO || "3503803010";

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: {
    rol: "admin",
    role: "admin",
    super_admin: true,
  },
  user_metadata: {
    rol: "admin",
    role: "admin",
    super_admin: true,
    nombre,
    telefono,
  },
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("usuarios").upsert({
  id: data.user.id,
  email,
  rol: "admin",
  nombre,
  telefono,
  activo: true,
});

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

console.log(`Super admin creado: ${email}`);
