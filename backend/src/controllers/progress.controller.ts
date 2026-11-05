import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  getProgressSummary,
  getWeeklyProgress,
  getMonthlyProgress,
  getUserStreak,
  getBestForExercise,
  getProgressByExercise,
} from '../services/progress.service.js';

export async function handleGetSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const summary = await getProgressSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetWeekly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const weekly = await getWeeklyProgress(userId);

    res.status(200).json({
      success: true,
      data: weekly,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetMonthly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const monthly = await getMonthlyProgress(userId);

    res.status(200).json({
      success: true,
      data: monthly,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetStreak(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const streak = await getUserStreak(userId);

    res.status(200).json({
      success: true,
      data: streak,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetBestForExercise(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const exercise = req.params.exercise;
    const best = await getBestForExercise(userId, exercise);

    res.status(200).json({
      success: true,
      data: best,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetByExercise(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const breakdown = await getProgressByExercise(userId);

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
}
