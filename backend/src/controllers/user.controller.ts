import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  getUserProfileAndSettings,
  updateUserProfile,
  updateUserSettings,
  deleteUserAccount,
} from '../services/user.service.js';

export async function handleGetMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await getUserProfileAndSettings(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const updated = await updateUserProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const updated = await updateUserSettings(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Pengaturan berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUploadAvatar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    // Avatar upload handler: accepts avatarUrl from body or default generated avatar
    const avatarUrl = req.body.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;
    const updated = await updateUserProfile(userId, { avatarUrl });

    res.status(200).json({
      success: true,
      message: 'Avatar berhasil diperbarui',
      data: { avatarUrl: updated.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await deleteUserAccount(userId);
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}
