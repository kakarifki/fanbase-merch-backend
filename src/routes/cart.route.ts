import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../middleware/auth';
import { z } from 'zod'; // Import Zod untuk validasi

const cartRoutes = new Hono();
const prisma = new PrismaClient();

// Skema Validasi untuk Request Body
const addToCartSchema = z.object({
  quantity: z.number().int().positive().default(1), // Quantity default 1
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

// POST /cart/:productId - Menambahkan product ke cart
cartRoutes.post('/:productId', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const productId = c.req.param('productId');

  try {
    // Validasi request body
    const body = await c.req.json();
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ message: 'Invalid quantity', errors: validation.error }, 400);
    }

    const { quantity } = validation.data; // Dapatkan quantity dari body

    // Cek apakah product ada
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return c.json({ message: 'Product not found' }, 404);
    }

    // Cek apakah product sudah ada di cart user
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        productId: productId,
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
          productId: productId,
          quantity: quantity, // Gunakan quantity dari request body
        },
      });
      return c.json(newCartItem, 201);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return c.json({ message: 'Failed to add to cart' }, 500);
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
