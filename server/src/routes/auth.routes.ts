import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

// Register routes
router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

// Login route
router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

// Refresh token route
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
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