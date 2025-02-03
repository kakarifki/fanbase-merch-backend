import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const productRoutes = new Hono();

// Schema validation
const createProductSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  price: z.number().positive(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  fanbase: z.string().optional(),
});

type CreateProductInput = z.infer<typeof createProductSchema>;

// GET /products/:code
productRoutes.get('/:code', async (c) => {
  const { code } = c.req.param();
  const product = await prisma.product.findUnique({ where: { code } });

  if (!product) {
    return c.json({ message: 'Product not found' }, 404);
  }

  return c.json(product);
});

// POST /products
productRoutes.post('/', async (c) => {
  const body: CreateProductInput = await c.req.json();
  const validation = createProductSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      { message: 'Invalid input', errors: validation.error },
      400,
    );
  }

  const productData = {
    code: body.code,
    name: body.name,
    price: body.price,
    description: body.description || null, // Default null jika tidak diisi
    imageUrl: body.imageUrl || null, // Default null jika tidak diisi
    fanbase: body.fanbase || null, // Default null jika tidak diisi
  };

  const product = await prisma.product.create({
    data: productData,
  });
  return c.json(product, 201);
});

export default productRoutes;