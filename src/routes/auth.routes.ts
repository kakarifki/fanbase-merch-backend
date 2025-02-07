// src/routes/auth.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';
import { PrismaClient } from '@prisma/client';
import { createJwt } from '../lib/jwt';
import { checkAuth } from '../middleware/auth';

const authRoutes = new Hono();
const prisma = new PrismaClient();

// Register
authRoutes.post(
  '/register',
  zValidator('json', RegisterSchema),
  async (c) => {
    const body = c.req.valid('json');
    try {
      // Hash password menggunakan Bun.password.hash
      const hashedPassword = await Bun.password.hash(body.password, {
        algorithm: 'argon2id',
      });

      const newUser = await prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      });

      return c.json({ message: 'User registered successfully' }, 201);
    } catch (error) {
      console.error('Error during registration:', error);
      return c.json({ message: 'Failed to register user' }, 500);
    }
  }
);

// Login
authRoutes.post(
  '/login',
  zValidator('json', LoginSchema),
  async (c) => {
    const body = c.req.valid('json');
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        return c.json({ message: 'Invalid credentials' }, 401);
      }

      // Verifikasi password menggunakan Bun.password.verify
      const passwordMatch = await Bun.password.verify(body.password, user.password);

      if (!passwordMatch) {
        return c.json({ message: 'Invalid credentials' }, 401);
      }

      // Buat token JWT
      const token = await createJwt(user.id);

      return c.json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      return c.json({ message: 'Failed to login' }, 500);
    }
  }
);

// Get Me (Protected Route)
authRoutes.get('/me', checkAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  return c.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

export default authRoutes;
