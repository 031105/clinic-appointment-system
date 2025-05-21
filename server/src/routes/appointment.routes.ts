import { Router } from 'express';
import { 
  getAppointmentById, 
  createAppointment, 
  cancelAppointment, 
  rescheduleAppointment, 
  confirmAppointment,
  getDoctorAvailableSlots,
  getAppointmentMedicalRecord
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// 获取预约详情
router.get('/:id', authenticate, getAppointmentById);

// 创建新预约
router.post('/', authenticate, createAppointment);

// 取消预约
router.post('/:id/cancel', authenticate, cancelAppointment);

// 重新安排预约
router.post('/:id/reschedule', authenticate, rescheduleAppointment);

// 确认预约
router.post('/:id/confirm', authenticate, confirmAppointment);

// 获取医生可用时间段
router.get('/doctors/:doctorId/available-slots', getDoctorAvailableSlots);

// 获取预约相关的医疗记录
router.get('/:id/medical-record', authenticate, getAppointmentMedicalRecord);

export default router;
