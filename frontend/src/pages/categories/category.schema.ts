import { z } from "zod";

export const categorySchema = z.object({
  categoryName: z.string().trim().min(1, "Category name is required"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
