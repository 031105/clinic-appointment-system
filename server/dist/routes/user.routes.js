"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Setup multer for memory storage (for BLOB)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// Middleware for uploading profile image
const uploadProfileImage = upload.single('profileImage');
// User profile routes
router.get('/me', auth_1.authenticate, userController.getCurrentUser);
// Get profile image as BLOB (public)
router.get('/profile-image/:userId', userController.getProfileImageBlob);
// Upload profile image as BLOB (protected)
router.post('/profile-image', auth_1.authenticate, uploadProfileImage, userController.uploadProfileImageBlob);
exports.default = router;
//# sourceMappingURL=user.routes.js.map