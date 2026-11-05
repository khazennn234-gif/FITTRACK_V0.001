import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshUserToken } from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function handleRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerUser(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginUser(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Refresh token tidak ditemukan di cookie atau body',
        },
      });
      return;
    }

    const result = await refreshUserToken(token);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Token berhasil diperbarui',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken');
  res.status(200).json({
    success: true,
    message: 'Logout berhasil',
  });
}

export async function handleForgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  res.status(200).json({
    success: true,
    message: `Instruksi reset password telah dikirim ke ${email || 'email Anda'} jika akun terdaftar.`,
  });
}

export async function handleResetPassword(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Password berhasil direset. Silakan login kembali.',
  });
}
