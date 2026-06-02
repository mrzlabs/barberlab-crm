import { z } from "zod";

export const emailSchema = z.string().trim().email();

export const passwordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(8),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

