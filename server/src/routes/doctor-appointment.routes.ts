import { Router } from 'express';
import { 
  getDoctorAppointments,
  getDoctorAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNotes
} from '../controllers/doctor-appointment.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { 
  getDoctorAppointmentsSchema,
  getDoctorAppointmentByIdSchema,
  updateAppointmentStatusSchema,
  updateAppointmentNotesSchema
} from '../schemas/doctor-appointment.schema';

const router = Router();

// 所有路由都需要医生认证
router.use(authenticate);

// 获取医生的所有预约
router.get(
  '/',
  validate(getDoctorAppointmentsSchema),
  getDoctorAppointments
);

// 获取单个预约详情
router.get(
  '/:id',
  validate(getDoctorAppointmentByIdSchema),
  getDoctorAppointmentById
);

// 更新预约状态
router.patch(
  '/:id/status',
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

// 更新预约备注
router.patch(
  '/:id/notes',
  validate(updateAppointmentNotesSchema),
  updateAppointmentNotes
);

export default router; 