import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter').trim().optional(),
  avatarUrl: z.string().url('URL Avatar tidak valid').max(500).nullable().optional(),
  // role & tier are protected system fields — users cannot self-assign roles (Privilege Escalation protection)
  height: z.number().positive().max(300).nullable().optional(),
  weight: z.number().positive().max(500).nullable().optional(),
  age: z.number().int().positive().max(120).nullable().optional(),
  fitnessGoal: z.enum(['strength', 'cardio', 'mobility']).optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  dailyRepTarget: z.number().int().positive().max(1000).optional(),
});

export const updateSettingsSchema = z.object({
  soundVolume: z.number().int().min(0).max(100).optional(),
  soundFeedback: z.boolean().optional(),
  gpuAcceleration: z.boolean().optional(),
  cameraMirror: z.boolean().optional(),
  poseStrictness: z.enum(['loose', 'normal', 'strict']).optional(),
  difficulty: z.enum(['easy', 'normal', 'strict']).optional(),
  darkMode: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
