import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  createWorkoutSession,
  listWorkoutSessions,
  getWorkoutSessionById,
  deleteWorkoutSessionById,
  deleteAllWorkoutSessions,
} from '../services/session.service.js';

export async function handleCreateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const session = await createWorkoutSession(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Sesi latihan berhasil disimpan',
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await listWorkoutSessions(userId, req.query as any);

    res.status(200).json({
      success: true,
      data: result.sessions,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetSessionById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const session = await getWorkoutSessionById(userId, req.params.id);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteSessionById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await deleteWorkoutSessionById(userId, req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteAllSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await deleteAllWorkoutSessions(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}
