import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
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
  authController.initiateRegister
);

// Complete registration route (step 2) - verify OTP and create user
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

// OTP verification route
router.post(
  '/verify-otp',
  validate(verifyOTPSchema),
  authController.verifyOTPEndpoint
);

// Resend OTP route
router.post(
  '/resend-otp',
  validate(resendOTPSchema),
  authController.resendOTP
);

// Refresh token route
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Logout route
router.post('/logout', authController.logout);

// Forgot password route (sends temporary password)
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset password with temporary password route
router.post(
  '/reset-password-temp',
  validate(resetPasswordWithTempSchema),
  authController.resetPasswordWithTemp
);

// Reset password route (traditional token-based)
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Verify email route (traditional email link)
router.get('/verify-email/:token', authController.verifyEmail);

export default router; 