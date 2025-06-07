import { Router } from 'express';
import adminSettingsController from '../controllers/admin-settings.controller';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证和管理员权限
router.use(authenticate);
router.use(checkRole(['admin']));

// Get all settings grouped by category
router.get('/', adminSettingsController.getAllSettings);

// Get setting categories
router.get('/categories', adminSettingsController.getCategories);

// Get settings by category
router.get('/category/:category', adminSettingsController.getSettingsByCategory);

// Get single setting by key
router.get('/setting/:key', adminSettingsController.getSettingByKey);

// Update multiple settings
router.put('/', adminSettingsController.updateSettings);

// Update single setting
router.put('/setting/:key', adminSettingsController.updateSetting);

export default router; 