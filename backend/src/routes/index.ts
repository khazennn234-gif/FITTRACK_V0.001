import { Router } from 'express';
import authRouter from './auth.routes.js';
import usersRouter from './users.routes.js';
import sessionsRouter from './sessions.routes.js';
import progressRouter from './progress.routes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FitTrack API is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/progress', progressRouter);

export default apiRouter;
