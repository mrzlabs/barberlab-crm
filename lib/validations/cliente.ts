import { z } from "zod";

export const buscarSlotsSchema = z.object({
  servicioId: z.string().uuid().optional(),
  empleadoId: z.string().uuid().optional(),
  fecha: z.string().min(10).optional(),
});

export const reservarSchema = z.object({
  servicioId: z.string().uuid(),
  empleadoId: z.string().uuid(),
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
});

export const citaIdSchema = z.object({
  citaId: z.string().uuid(),
});

export const reprogramarSchema = reservarSchema.extend({
  citaId: z.string().uuid(),
});
