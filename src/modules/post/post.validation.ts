import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().trim().min(3).max(100),
  content: z.string().min(1),
});

export const postValidation = {
  createPostSchema,
};
