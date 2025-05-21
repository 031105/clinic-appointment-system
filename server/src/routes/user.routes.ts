import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Setup multer for memory storage (for BLOB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware for uploading profile image
const uploadProfileImage = upload.single('profileImage');

// User profile routes
router.get('/me', authenticate, userController.getCurrentUser);

// Get profile image as BLOB (public)
router.get('/profile-image/:userId', userController.getProfileImageBlob);

// Upload profile image as BLOB (protected)
router.post(
  '/profile-image',
  authenticate,
  uploadProfileImage, 
  userController.uploadProfileImageBlob
);

export default router; 