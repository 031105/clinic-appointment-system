import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as medicalRecordController from '../controllers/medical-record.controller';

const router = Router();

// 获取单个医疗记录
router.get('/:id', authenticate, medicalRecordController.getMedicalRecord);

// 获取患者的所有医疗记录
router.get('/patient/records', authenticate, medicalRecordController.getPatientMedicalRecords);

// 创建医疗记录
router.post('/', authenticate, medicalRecordController.createMedicalRecord);

// 更新医疗记录
router.put('/:id', authenticate, medicalRecordController.updateMedicalRecord);

// 删除医疗记录
router.delete('/:id', authenticate, medicalRecordController.deleteMedicalRecord);

export default router; 