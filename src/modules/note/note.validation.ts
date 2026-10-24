import { z } from "zod";

const createNoteSchema = z.object({
  title: z.string().trim().min(3).max(100),
  content: z.string().min(1),
});

const updateNoteSchema = z
  .object({
    title: z.string().trim().min(3).max(100).optional(),
    content: z.string().min(1).optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "At least one field is required for update",
  });

export const noteValidation = {
  createNoteSchema,
  updateNoteSchema,
};
