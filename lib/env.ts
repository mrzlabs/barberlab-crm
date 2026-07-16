import { isDemoDeployment } from "@/lib/demo";

// Variables requeridas cuando la app corre contra Supabase real.
// SUPABASE_SERVICE_ROLE_KEY solo la usan las actions de super-admin
// (crear negocios/usuarios); si falta, esas operaciones fallan.
const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL"] as const;
const RECOMMENDED = ["SUPABASE_SERVICE_ROLE_KEY"] as const;

export function getMissingEnv() {
  if (isDemoDeployment()) return { required: [] as string[], recommended: [] as string[] };
  return {
    required: REQUIRED.filter((name) => !process.env[name]),
    recommended: RECOMMENDED.filter((name) => !process.env[name]),
  };
}

let warned = false;

// Se invoca desde el layout raíz: registra una sola vez, en el arranque del
// servidor, qué variables faltan — en vez de fallar en runtime a mitad de un
// flujo (ej. crear negocio sin SUPABASE_SERVICE_ROLE_KEY).
export function warnMissingEnv() {
  if (warned) return;
  warned = true;
  const { required, recommended } = getMissingEnv();
  if (required.length > 0) {
    console.error(
      `[operux][env] FALTAN variables requeridas: ${required.join(", ")}. ` +
      "La aplicación no funcionará contra Supabase sin ellas.",
    );
  }
  if (recommended.length > 0) {
    console.warn(
      `[operux][env] Faltan variables recomendadas: ${recommended.join(", ")}. ` +
      "Crear negocios/usuarios desde super-admin fallará hasta configurarlas.",
    );
  }
}
