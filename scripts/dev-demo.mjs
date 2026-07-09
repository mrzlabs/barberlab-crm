import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

process.env.OPERUX_DEMO_MODE = "true";
process.env.BARBERLAB_DEMO_MODE = "true"; // compat con scripts antiguos
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "placeholder";
process.env.DATABASE_URL ||= "postgres://postgres:postgres@127.0.0.1:54322/postgres";
process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3012";
process.env.BARBERLAB_NEXT_DIST_DIR = ".next-demo";

rmSync(join(process.cwd(), ".next-demo"), { force: true, recursive: true });

const runner = process.platform === "win32" ? "cmd.exe" : "npx";
const args = process.platform === "win32"
  ? ["/d", "/s", "/c", "npx next dev --hostname 127.0.0.1 --port 3012"]
  : ["next", "dev", "--hostname", "127.0.0.1", "--port", "3012"];

const child = spawn(runner, args, {
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
