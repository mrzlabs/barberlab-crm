import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

process.env.BARBERLAB_DEMO_MODE = "false";
process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3011";
process.env.BARBERLAB_NEXT_DIST_DIR = ".next-prod";

rmSync(join(process.cwd(), ".next-prod"), { force: true, recursive: true });

const runner = process.platform === "win32" ? "cmd.exe" : "npx";
const args = process.platform === "win32"
  ? ["/d", "/s", "/c", "npx next dev --hostname 127.0.0.1 --port 3011"]
  : ["next", "dev", "--hostname", "127.0.0.1", "--port", "3011"];

const child = spawn(runner, args, {
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
