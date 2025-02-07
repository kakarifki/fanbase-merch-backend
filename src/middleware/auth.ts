// src/middleware/auth.ts
import { Context, Next } from 'hono';
import { verifyJwt } from '../lib/jwt';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Define a custom type for the context to include the user
interface CustomContext extends Context {
  user?: User;
}

export const checkAuth = async (c: CustomContext, next: Next) => {
  const tokenHeader = c.req.header('Authorization');

  if (!tokenHeader) {
    return c.json({ message: 'Authorization header is missing' }, 401);
  }

  const token = tokenHeader.split(' ')[1]; // Assuming "Bearer <token>"

  if (!token) {
    return c.json({ message: 'Invalid token format' }, 401);
  }

  try {
    const decoded = await verifyJwt(token);

    if (!decoded) {
      return c.json({ message: 'Invalid token' }, 401);
    }

    // Pastikan payload JWT memiliki properti 'sub' dan 'sub.user_id'
    if (!decoded.sub || typeof decoded.sub !== 'object' || !('user_id' in decoded.sub)) {
        return c.json({ message: 'Invalid token payload' }, 401);
    }

    const userId = (decoded.sub as { user_id: string }).user_id;

    

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    c.set('user', user); // Attach user to the context
    await next();
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return c.json({ message: 'Invalid token' }, 401);
  }
};

// Middleware untuk role-based access control (RBAC)
export const checkRole = (roles: string[]) => {
  return async (c: CustomContext, next: Next) => {
    const user = c.get('user') as User | undefined;
    if (!user) {
      return c.json({ message: 'Unauthorized' }, 403);
    }

    if (!roles.includes(user.role)) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    await next();
  };
};
