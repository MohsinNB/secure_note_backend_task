import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.email("Provide a valid email address").max(254),

  password: z.string().min(8).max(72),

  interests: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),

  password: z.string().min(1).max(72),
});

export const authValidation = {
  registerSchema,
  loginSchema,
};
