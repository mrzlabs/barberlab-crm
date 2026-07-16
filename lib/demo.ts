import { isRole, type UserRole } from "@/lib/auth/roles";

export const DEMO_COOKIE = "operux_demo_session";
export const DEMO_TTL_SECONDS = 2 * 60 * 60;

export const demoCreds = {
  email: "admin@operux.local",
  password: "Operux2026!",
  role: "admin" as UserRole,
};

export const demoUsers = [
  { email: "superadmin@operux.local", password: "Operux2026!", role: "super_admin" as UserRole, nombre: "Super Admin MRZ" },
  { email: "admin@operux.local", password: "Operux2026!", role: "admin" as UserRole, nombre: "Admin Smart Style" },
  { email: "empleado@operux.local", password: "Operux2026!", role: "empleado" as UserRole, nombre: "Mateo Barber" },
  { email: "cliente@operux.local", password: "Operux2026!", role: "cliente" as UserRole, nombre: "Laura Cliente" },
];

export function getDemoUser(email?: string | null, password?: string | null) {
  return demoUsers.find((user) => user.email === email && user.password === password) ?? null;
}

export function getDemoUserByRole(role?: string | null) {
  return demoUsers.find((user) => user.role === role) ?? null;
}

export function isDemoDeployment() {
  return process.env.OPERUX_DEMO_MODE === "true";
}

export function isDemoEnabled() {
  return isDemoDeployment() || process.env.NEXT_PUBLIC_DEMO_ENABLED === "true";
}

function getDemoSecret() {
  const secret = process.env.OPERUX_DEMO_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") return "operux-local-demo-session";
  return null;
}

function toBase64Url(value: Uint8Array) {
  const binary = String.fromCharCode(...value);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getSigningKey() {
  const secret = getDemoSecret();
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createDemoToken(role: UserRole) {
  const key = await getSigningKey();
  if (!key) throw new Error("OPERUX_DEMO_SECRET no configurada");

  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({
    role,
    exp: Math.floor(Date.now() / 1000) + DEMO_TTL_SECONDS,
    version: 1,
  })));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function getDemoRoleFromToken(token?: string | null): Promise<UserRole | null> {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const key = await getSigningKey();
  if (!key) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      role?: string;
      exp?: number;
      version?: number;
    };
    if (data.version !== 1 || !isRole(data.role) || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data.role;
  } catch {
    return null;
  }
}
