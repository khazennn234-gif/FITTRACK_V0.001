import { Router } from 'express';
import {
  handleCreateSession,
  handleListSessions,
  handleGetSessionById,
  handleDeleteSessionById,
  handleDeleteAllSessions,
} from '../controllers/session.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { sessionCreationLimiter } from '../middlewares/rateLimit.middleware.js';
import { createSessionSchema, sessionQuerySchema } from '../schemas/session.schema.js';

const router = Router();

router.use(requireAuth);

router.post('/', sessionCreationLimiter, validateBody(createSessionSchema), handleCreateSession);
router.get('/', validateQuery(sessionQuerySchema), handleListSessions);
router.get('/:id', handleGetSessionById);
router.delete('/:id', handleDeleteSessionById);
router.delete('/', handleDeleteAllSessions);

export default router;
