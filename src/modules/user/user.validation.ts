import { z } from "zod";

const interestsSchema = z
  .array(z.string().trim().toLowerCase().min(1).max(30))
  .max(20)
  .transform((list) => [...new Set(list)]);

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(64),
  role: z.enum(["user", "admin"]).optional(),
  interests: interestsSchema.optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    email: z.email().optional(),
    password: z.string().min(8).max(64).optional(),
    role: z.enum(["user", "admin"]).optional(),
    interests: interestsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const userValidation = {
  createUserSchema,
  updateUserSchema,
};
