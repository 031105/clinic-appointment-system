import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import * as adminSettingController from '../controllers/admin-setting.controller';

const router = Router();
const upload = multer();

// 管理员个人资料API
router.get('/profile', authenticate, adminSettingController.getAdminProfile);
router.put('/profile', authenticate, adminSettingController.updateAdminProfile);

// 上传头像
router.post('/profile/picture', authenticate, upload.single('profilePicture'), adminSettingController.uploadProfilePicture);

// 修改密码
router.post('/change-password', authenticate, adminSettingController.changePassword);

export default router; 