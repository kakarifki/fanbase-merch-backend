// backend/src/routes/auth.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const auth = new Hono();
const prisma = new PrismaClient();

const registerSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

auth.post('/sign-up/email', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json');
  try {
    // Lakukan registrasi user menggunakan Prisma
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // Hash password sebelum disimpan!
        name: data.name,
        username: data.username,
        emailVerified: false,
      },
    });
    return c.json({ message: 'Registrasi berhasil!' });
  } catch (error: any) {
    console.error("Error during registration:", error);
    return c.json({ message: error.message }, 500); // Kembalikan pesan error
  }
});

export default auth;
