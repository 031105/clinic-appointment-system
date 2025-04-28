import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

// Register routes
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

// Login route
router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

// Refresh token route
router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

// Logout route
router.post('/logout', authController.logout);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

// Verify email route
router.get('/verify-email/:token', authController.verifyEmail);

export default router; 