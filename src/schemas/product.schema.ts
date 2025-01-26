import { z } from "@hono/zod-openapi";

export const createProductSchema = z.object({
    code: z.string().min(3),
    name: z.string().min(3),
    price: z.number().positive(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    fanbase: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>
