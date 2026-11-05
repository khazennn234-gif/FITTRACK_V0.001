import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter').trim(),
  email: z.string().email('Format email tidak valid').max(255).trim().toLowerCase(),
  password: z.string().min(6, 'Password minimal 6 karakter').max(128, 'Password maksimal 128 karakter'),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(500).optional(),
  age: z.number().int().positive().max(120).optional(),
  fitnessGoal: z.enum(['strength', 'cardio', 'mobility']).optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  dailyRepTarget: z.number().int().positive().max(1000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid').max(255).trim().toLowerCase(),
  password: z.string().min(1, 'Password diperlukan').max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token diperlukan').max(512).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
