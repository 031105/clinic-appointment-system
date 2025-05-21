"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Register routes
router.post('/register', (0, validate_1.validate)(auth_schema_1.registerSchema), authController.register);
// Login route
router.post('/login', (0, validate_1.validate)(auth_schema_1.loginSchema), authController.login);
// Refresh token route
router.post('/refresh-token', (0, validate_1.validate)(auth_schema_1.refreshTokenSchema), authController.refreshToken);
// Logout route
router.post('/logout', authController.logout);
// Forgot password route
router.post('/forgot-password', authController.forgotPassword);
// Reset password route
router.post('/reset-password', authController.resetPassword);
// Verify email route
router.get('/verify-email/:token', authController.verifyEmail);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map