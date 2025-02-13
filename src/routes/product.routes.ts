import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateProductCode } from '../utils/generatecode';

const prisma = new PrismaClient();
const productRoutes = new Hono();

// Schema validation (code jadi opsional)
const createProductSchema = z.object({
  code: z.string().min(3).optional(), // Code tidak wajib diisi
  name: z.string().min(3),
  price: z.number().positive(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  fanbase: z.string().optional(),
});

type CreateProductInput = z.infer<typeof createProductSchema>;

// POST /products
productRoutes.post('/', async (c) => {
  const body: CreateProductInput = await c.req.json();
  const validation = createProductSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      { message: 'Invalid input', errors: validation.error },
      400
    );
  }

  // Jika `code` tidak diberikan, generate otomatis
  const productCode = body.code || generateProductCode(body.name);

  const productData = {
    code: productCode, // Gunakan code yang sudah ada atau hasil generate
    name: body.name,
    price: body.price,
    description: body.description || null,
    imageUrl: body.imageUrl || null,
    fanbase: body.fanbase || null,
  };

  try {
    const product = await prisma.product.create({
      data: productData,
    });
    return c.json(product, 201);
  } catch (error) {
    return c.json({ message: 'Error creating product', error }, 500);
  }
});

// GET /products
productRoutes.get('/', async (c) => {
  const products = await prisma.product.findMany();
  return c.json(products);
});

// GET /products/:code
productRoutes.get('/:code', async (c) => {
  const { code } = c.req.param();
  const product = await prisma.product.findUnique({ where: { code } });

  if (!product) {
    return c.json({ message: 'Product not found' }, 404);
  }

  return c.json(product);
});

export default productRoutes;
