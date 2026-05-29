import { z } from "zod";

export const emailSchema = z.string().email();

export const passwordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});
