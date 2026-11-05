import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada internal server';
  let code = err.code || 'INTERNAL_SERVER_ERROR';

  // Handle CORS rejection
  if (err.message && err.message.startsWith('CORS blocked:')) {
    statusCode = 403;
    code = 'CORS_FORBIDDEN';
  }

  // Prevent information leakage in production on 500 errors
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Terjadi kesalahan internal pada server';
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${code} (${statusCode}):`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
