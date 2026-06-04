import { createClient } from "@supabase/supabase-js";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv();

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPERUX_SUPER_ADMIN_EMAIL",
  "OPERUX_SUPER_ADMIN_PASSWORD",
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

const email    = process.env.OPERUX_SUPER_ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.OPERUX_SUPER_ADMIN_PASSWORD;
const nombre   = process.env.OPERUX_SUPER_ADMIN_NOMBRE || "Super Admin Operux";
const telefono = process.env.OPERUX_SUPER_ADMIN_TELEFONO || "3503803010";

const metadata = {
  app_metadata: {
    rol: "super_admin",
    role: "super_admin",
    super_admin: true,
  },
  user_metadata: {
    rol: "super_admin",
    role: "super_admin",
    super_admin: true,
    nombre,
    telefono,
  },
};

let { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  ...metadata,
});

if (error?.message?.includes("already been registered")) {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    console.error(listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find((user) => user.email?.toLowerCase() === email);
  if (!existing) {
    console.error("Usuario existente no encontrado en Auth");
    process.exit(1);
  }

  const update = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    ...metadata,
  });
  if (update.error) {
    console.error(update.error.message);
    process.exit(1);
  }
  data = { user: update.data.user };
  error = null;
}

if (error) {
  console.error(error.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("usuarios").upsert({
  id: data.user.id,
  email,
  rol: "super_admin",
  nombre,
  telefono,
  super_admin: true,
  activo: true,
});

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

console.log(`Super admin creado: ${email}`);
