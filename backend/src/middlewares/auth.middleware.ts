import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.utils.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak: Token autentikasi tidak ditemukan',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Token tidak valid atau telah kedaluwarsa',
      },
    });
  }
};
