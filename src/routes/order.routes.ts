// src/routes/order.ts
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../middleware/auth';

const orderRoutes = new Hono();
const prisma = new PrismaClient();

// POST /order/checkout - Membuat Order (Checkout)
orderRoutes.post('/checkout', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    // 1. Dapatkan item di cart user
    const cartItems = await prisma.cart.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: true, // Include informasi product
      },
    });

    if (cartItems.length === 0) {
      return c.json({ message: 'Cart is empty' }, 400);
    }

    // 2. Hitung total harga
    let totalPrice = 0;
    for (const item of cartItems) {
      totalPrice += item.product.price * item.quantity;
    }

    // 3. Buat Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalPrice: totalPrice,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // Simpan harga saat order dibuat
          })),
        },
      },
    });

    // 4. Kosongkan cart user
    await prisma.cart.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return c.json(order, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ message: 'Failed to create order' }, 500);
  }
});

// GET /order/:orderId - Mendapatkan Detail Order
orderRoutes.get('/:orderId', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const orderId = c.req.param('orderId');

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id, // Hanya user yang membuat order yang bisa melihat detailnya
      },
      include: {
        orderItems: {
          include: {
            product: true, // Include informasi product di setiap order item
          },
        },
      },
    });

    if (!order) {
      return c.json({ message: 'Order not found' }, 404);
    }

    return c.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ message: 'Failed to fetch order' }, 500);
  }
});

export default orderRoutes;
