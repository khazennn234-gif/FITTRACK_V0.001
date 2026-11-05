import { Router } from 'express';
import {
  handleGetMe,
  handleUpdateProfile,
  handleUpdateSettings,
  handleUploadAvatar,
  handleDeleteAccount,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, updateSettingsSchema } from '../schemas/user.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/me', handleGetMe);
router.put('/me/profile', validateBody(updateProfileSchema), handleUpdateProfile);
router.put('/me/settings', validateBody(updateSettingsSchema), handleUpdateSettings);
router.post('/me/avatar', handleUploadAvatar);
router.delete('/me', handleDeleteAccount);

export default router;
