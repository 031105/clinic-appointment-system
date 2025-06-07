import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import * as doctorSettingController from '../controllers/doctor-setting.controller';

const router = Router();
const upload = multer();

// 医生个人资料API
router.get('/profile', authenticate, doctorSettingController.getDoctorProfile);
router.put('/profile', authenticate, doctorSettingController.updateDoctorProfile);
router.post('/profile/picture', authenticate, upload.single('profilePicture'), doctorSettingController.uploadProfilePicture);
router.post('/change-password', authenticate, doctorSettingController.changePassword);

export default router; 