import { Router } from 'express';
import {
  handleRegister,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
} from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema.js';

const router = Router();

// Apply auth rate limiting to mitigate brute-force and credential stuffing
router.post('/register', authLimiter, validateBody(registerSchema), handleRegister);
router.post('/login', authLimiter, validateBody(loginSchema), handleLogin);
router.post('/refresh', validateBody(refreshTokenSchema), handleRefreshToken);
router.post('/logout', requireAuth, handleLogout);
router.post('/forgot-password', authLimiter, handleForgotPassword);
router.post('/reset-password', authLimiter, handleResetPassword);

export default router;
