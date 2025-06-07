import { Router } from 'express';
import { 
  getDoctorAppointments,
  getDoctorAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNotes,
  markAppointmentAsCompleted,
  markAppointmentAsNoShow,
  getTodayAppointments
} from '../controllers/doctor-appointment.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { validateDoctorRole } from '../middleware/role-validator';
import { 
  getDoctorAppointmentsSchema,
  getDoctorAppointmentByIdSchema,
  updateAppointmentStatusSchema,
  updateAppointmentNotesSchema
} from '../schemas/doctor-appointment.schema';

const router = Router();

// 所有路由都需要医生认证
router.use(authenticate);
router.use(validateDoctorRole);

// 获取医生的所有预约
router.get(
  '/',
  validate(getDoctorAppointmentsSchema),
  getDoctorAppointments
);

// 获取今天所有的预约
router.get('/today', getTodayAppointments);

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

// 标记预约为完成
router.patch('/:id/complete', markAppointmentAsCompleted);

// 标记预约为未出席
router.patch('/:id/no-show', markAppointmentAsNoShow);

export default router; 