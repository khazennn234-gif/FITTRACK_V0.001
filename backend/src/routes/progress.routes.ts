import { Router } from 'express';
import {
  handleGetSummary,
  handleGetWeekly,
  handleGetMonthly,
  handleGetStreak,
  handleGetBestForExercise,
  handleGetByExercise,
} from '../controllers/progress.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', handleGetSummary);
router.get('/weekly', handleGetWeekly);
router.get('/monthly', handleGetMonthly);
router.get('/streak', handleGetStreak);
router.get('/best/:exercise', handleGetBestForExercise);
router.get('/by-exercise', handleGetByExercise);

export default router;
