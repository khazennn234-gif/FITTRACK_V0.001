import { z } from 'zod';

export const repFeedbackSchema = z.object({
  rep: z.number().int().nonnegative().max(10000),
  message: z.string().min(1).max(300).trim(),
  type: z.enum(['good', 'bad']),
});

export const createSessionSchema = z.object({
  exercise: z.string().min(1).max(50).trim(),
  exerciseIcon: z.string().max(30).default('🏋️'),
  reps: z.number().int().nonnegative().max(10000),
  targetReps: z.number().int().nonnegative().max(10000),
  duration: z.number().int().nonnegative().max(86400), // max 24 hours in seconds
  formScore: z.number().min(0).max(100),
  goodReps: z.number().int().nonnegative().max(10000),
  badReps: z.number().int().nonnegative().max(10000),
  calories: z.number().nonnegative().max(50000),
  statusBadge: z.string().max(50).optional(),
  feedback: z.array(repFeedbackSchema).max(100).optional().default([]), // bounded array prevents memory exhaustion
});

export const sessionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  exercise: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(['date_desc', 'date_asc', 'form_desc', 'reps_desc']).optional().default('date_desc'),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SessionQueryParams = z.infer<typeof sessionQuerySchema>;
