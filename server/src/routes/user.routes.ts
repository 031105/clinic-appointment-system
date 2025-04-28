import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../schemas/user.schema';

const router = Router();
const userController = new UserController();

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update profile
router.patch(
  '/profile',
  validateRequest(updateProfileSchema),
  userController.updateProfile
);

// Change password
router.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  userController.changePassword
);

export default router; 