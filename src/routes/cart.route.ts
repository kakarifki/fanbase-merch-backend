import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../middleware/auth';
import { z } from 'zod'; // Import Zod untuk validasi

const cartRoutes = new Hono();
const prisma = new PrismaClient();

// Skema Validasi untuk Request Body
const addToCartSchema = z.object({
  productId: z.string().optional(),
  code: z.string().optional(),
  quantity: z.number().int().positive().default(1), // Quantity default 1
}).refine((data) => !!data.productId || !!data.code, {
  message: "Either productId or code must be provided",
  path: ["productId", "code"], // Specify the path where the error occurs
});

// GET /cart - Mendapatkan cart user yang sedang login
cartRoutes.get('/', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const cartItems = await prisma.cart.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: true, // Include informasi produk
      },
    });

    return c.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return c.json({ message: 'Failed to fetch cart' }, 500);
  }
});

// POST /cart/items - Menambahkan product ke cart
cartRoutes.post('/items', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    // Validasi request body
    const body = await c.req.json();
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ message: 'Invalid request', errors: validation.error.issues, statusCode: 400 }, 400); // Mengembalikan error Zod
    }

    const { productId, code, quantity } = validation.data;

    // Cari product berdasarkan ID atau Code
    let product;
    if (productId) {
      product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
    } else {
      product = await prisma.product.findUnique({
        where: {
          code: code,
        },
      });
    }

    if (!product) {
      return c.json({ message: 'Product not found', statusCode: 404 }, 404);
    }

    // Cek apakah product sudah ada di cart user
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
      },
    });

    if (existingCartItem) {
      // Jika sudah ada, update quantity
      const updatedCartItem = await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: {
            increment: quantity, // Tambahkan quantity dari request body
          },
        },
      });
      return c.json(updatedCartItem);
    } else {
      // Jika belum ada, buat cart item baru
      const newCartItem = await prisma.cart.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: quantity, // Gunakan quantity dari request body
        },
      });
      c.status(201);  // Set status code menjadi 201 (Created)
      return c.json(newCartItem);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return c.json({ message: 'Failed to add to cart', statusCode: 500 }, 500);
  }
});

// DELETE /cart/:productId - Menghapus product dari cart
cartRoutes.delete('/:productId', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const productId = c.req.param('productId');

  try {
    // Cari cart item yang ingin dihapus
    const cartItemToDelete = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    if (!cartItemToDelete) {
      return c.json({ message: 'Cart item not found' }, 404);
    }

    // Hapus cart item
    await prisma.cart.delete({
      where: {
        id: cartItemToDelete.id,
      },
    });

    return c.json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return c.json({ message: 'Failed to remove from cart' }, 500);
  }
});

export default cartRoutes;
