import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { passwordResetRateLimit, emailBasedRateLimit } from '../middleware/rateLimiter';
import { 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema, 
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
  resendOTPSchema,
  initialRegisterSchema,
  resetPasswordWithTempSchema
} from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

// Initial registration route (step 1) - sends OTP
router.post(
  '/register/initiate',
  validate(initialRegisterSchema),
  authController.initiateRegister.bind(authController)
);

// Complete registration route (step 2) - verifies OTP and creates account
router.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController)
);

// Login route
router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController)
);

// Refresh token route
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

// OTP verification route (for registration and other purposes)
router.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  authController.verifyOTPEndpoint.bind(authController)
);

// Resend OTP route
router.post(
  '/resend-otp',
  validate(resendOTPSchema),
  authController.resendOTP.bind(authController)
);

// Forgot password route (sends temporary password)
router.post(
  '/forgot-password',
  passwordResetRateLimit, // Rate limit by IP
  emailBasedRateLimit, // Rate limit by email
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

// Reset password with temporary password route
router.post(
  '/reset-password-temp',
  validate(resetPasswordWithTempSchema),
  authController.resetPasswordWithTemp.bind(authController)
);

// Reset password route (traditional token-based)
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

// Logout route
router.post('/logout', authController.logout.bind(authController));

// Verify email route (traditional email link)
router.get('/verify-email/:token', authController.verifyEmail.bind(authController));

export default router; 