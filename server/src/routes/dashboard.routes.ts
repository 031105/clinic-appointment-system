import { Router } from 'express';
import { validate } from '../middleware/validate';
import { getDoctorsSchema, getPatientAppointmentsSchema } from '../schemas/dashboard.schema';
import { 
  getDepartments, 
  getDoctors, 
  getPatientAppointments,
  getPatientProfile,
  getDoctorById
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// 公共路由 - 不需要认证
router.get('/departments', getDepartments);
router.get('/doctors', validate(getDoctorsSchema), getDoctors);
router.get('/doctors/:id', getDoctorById);

// 患者专用路由 - 需要认证
router.get('/patient-profile', authenticate, getPatientProfile);
router.get('/patient-appointments', authenticate, validate(getPatientAppointmentsSchema), getPatientAppointments);

export default router; 