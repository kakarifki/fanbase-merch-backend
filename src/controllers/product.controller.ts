import { Context } from "hono";
import prisma from "../db/prisma";
import { CreateProductInput, createProductSchema } from "../schemas/product.schema";
import productRoutes from "../routes/product.routes";

export const getProductByCode = async ( c ) => {
    const code = c.req.param();
    const product = await prisma.product.findUnique({ where: code });

    if (!product) {
        return c.json(
            {
                message: 'product not found'
            }, 404,
        )
    }

    return c.json(product);
}

export const createProduct = async (c: Context) => {
    const body: CreateProductInput = await c.req.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
        return c.json({
            message: 'invalid input',
            errors: validation.error,
        }, 400);
    }

    const product = await prisma.product.create({
        data: body
    });
    return c.json(product, 201);
};