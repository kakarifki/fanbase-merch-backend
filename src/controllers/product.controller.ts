import { Context } from "hono";
import prisma from "../db/prisma";

export const getProductByCode = async (c) => {
    const code = c.req.param();
    const product = await prisma.product.findUnique(
        {
            where: {code}
        }
    );

    if (!product) {
        return c.json(
            {
                message: 'product not found'
            }, 404,
        )
    }

    return c.json(product);
}