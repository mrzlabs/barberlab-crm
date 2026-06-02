import { z } from "zod";

export const buscarSlotsSchema = z.object({
  servicioId: z.string().trim().uuid().optional(),
  empleadoId: z.string().trim().uuid().optional(),
  fecha: z.string().trim().min(10).optional(),
});

export const reservarSchema = z.object({
  servicioId: z.string().trim().uuid(),
  empleadoId: z.string().trim().uuid(),
  inicio: z.string().trim().datetime(),
  fin: z.string().trim().datetime(),
});

export const citaIdSchema = z.object({
  citaId: z.string().trim().uuid(),
});

export const reprogramarSchema = reservarSchema.extend({
  citaId: z.string().trim().uuid(),
});

