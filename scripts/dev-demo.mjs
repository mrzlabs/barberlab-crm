import { spawn } from "node:child_process";

process.env.BARBERLAB_DEMO_MODE = "true";
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "placeholder";
process.env.DATABASE_URL ||= "postgres://postgres:postgres@127.0.0.1:54322/postgres";
process.env.NEXT_PUBLIC_APP_URL ||= "http://127.0.0.1:3012";

const child = spawn("next", ["dev", "--hostname", "127.0.0.1", "--port", "3012"], {
  env: process.env,
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
