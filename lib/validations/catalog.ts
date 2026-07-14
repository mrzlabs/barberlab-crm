import { z } from "zod";
import { formBool } from "./helpers";

const money = z.coerce.number().min(0);

export const servicioAdminSchema = z.object({
  categoria: z.enum(["barberia", "peluqueria", "spa_unas", "tatuajes"]),
  nombre: z.string().trim().min(2).max(120),
  duracionMin: z.coerce.number().int().min(15).max(480),
  precio: money,
  costoInsumo: money.default(0),
  activo: formBool(true),
});

export const empleadoAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().trim().min(8).max(72),
  telefono: z.string().trim().min(7).max(20),
  especialidad: z.enum(["barberia", "peluqueria", "spa_unas", "tatuajes"]),
  comisionPct: z.coerce.number().min(0).max(100),
  activo: formBool(true),
});

export const clienteAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().min(7).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  password: z.string().trim().min(8).max(72).optional().or(z.literal("")),
  crearCuenta: formBool(false),
  notas: z.string().trim().max(500).optional(),
});

