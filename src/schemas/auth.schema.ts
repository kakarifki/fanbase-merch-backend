// src/schemas/auth.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
