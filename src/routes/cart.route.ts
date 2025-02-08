// src/routes/cart.ts
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../middleware/auth';

const cartRoutes = new Hono();
const prisma = new PrismaClient();

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
            increment: 1, // Bisa diubah sesuai kebutuhan (contoh: c.req.json() untuk mendapatkan quantity dari body)
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
          quantity: 1, // Default quantity
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
