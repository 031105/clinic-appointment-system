import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as patientSettingController from '../controllers/patient-setting.controller';

const router = Router();

// 用户个人资料API
router.put('/profile', authenticate, patientSettingController.updateProfile);
router.post('/change-password', authenticate, patientSettingController.changePassword);

// 过敏信息API
router.get('/allergies', authenticate, patientSettingController.getAllergies);
router.post('/allergies', authenticate, patientSettingController.addAllergy);
router.put('/allergies/:id', authenticate, patientSettingController.updateAllergy);
router.delete('/allergies/:id', authenticate, patientSettingController.deleteAllergy);

// 紧急联系人API
router.get('/emergency-contacts', authenticate, patientSettingController.getEmergencyContacts);
router.post('/emergency-contacts', authenticate, patientSettingController.addEmergencyContact);
router.put('/emergency-contacts/:id', authenticate, patientSettingController.updateEmergencyContact);
router.delete('/emergency-contacts/:id', authenticate, patientSettingController.deleteEmergencyContact);

export default router; 