import { prisma } from '../utils/prisma.js';
import { CreateSessionInput, SessionQueryParams } from '../schemas/session.schema.js';

export async function createWorkoutSession(userId: string, input: CreateSessionInput) {
  const { feedback, ...sessionData } = input;

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      ...sessionData,
      feedback: feedback && feedback.length > 0 ? {
        create: feedback.map((fb) => ({
          rep: fb.rep,
          message: fb.message,
          type: fb.type,
        })),
      } : undefined,
    },
    include: {
      feedback: true,
    },
  });

  return session;
}

export async function listWorkoutSessions(userId: string, query: SessionQueryParams) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (query.exercise) {
    where.exercise = query.exercise;
  }

  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date.gte = new Date(query.from);
    if (query.to) where.date.lte = new Date(query.to);
  }

  let orderBy: any = { date: 'desc' };
  if (query.sort === 'date_asc') orderBy = { date: 'asc' };
  else if (query.sort === 'form_desc') orderBy = { formScore: 'desc' };
  else if (query.sort === 'reps_desc') orderBy = { reps: 'desc' };

  const [total, sessions] = await Promise.all([
    prisma.workoutSession.count({ where }),
    prisma.workoutSession.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        feedback: true,
      },
    }),
  ]);

  return {
    sessions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getWorkoutSessionById(userId: string, sessionId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      feedback: true,
    },
  });

  if (!session) {
    const error: any = new Error('Sesi latihan tidak ditemukan');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return session;
}

export async function deleteWorkoutSessionById(userId: string, sessionId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    const error: any = new Error('Sesi latihan tidak ditemukan');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  await prisma.workoutSession.delete({
    where: { id: sessionId },
  });

  return { message: 'Sesi latihan berhasil dihapus' };
}

export async function deleteAllWorkoutSessions(userId: string) {
  const deleted = await prisma.workoutSession.deleteMany({
    where: { userId },
  });

  return { message: `Berhasil menghapus ${deleted.count} sesi latihan` };
}
