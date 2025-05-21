import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import appointmentRoutes from './appointment.routes';
import patientRoutes from './patient.routes';
import patientSettingRoutes from './patient-setting.routes';
import medicalRecordRoutes from './medical-record.routes';
import doctorAppointmentRoutes from './doctor-appointment.routes';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

export const setupRoutes = () => {
  const router = Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes (public)
  router.use('/auth', authRoutes);

  // User routes (some protected, some public)
  router.use('/users', userRoutes);

  // Dashboard routes - 分离公共和受保护的路由
  router.use('/dashboard', dashboardRoutes);
  
  // 预约路由
  router.use('/appointments', appointmentRoutes);

  // 患者设置路由
  router.use('/patients', patientRoutes);

  // 患者个人设置路由
  logger.info('注册患者个人设置路由: /patient-setting');
  router.use('/patient-setting', patientSettingRoutes);

  // 医疗记录路由
  logger.info('注册医疗记录路由: /medical-records');
  router.use('/medical-records', authenticate, medicalRecordRoutes);

  // 医生预约管理路由
  logger.info('注册医生预约管理路由: /doctors/appointments');
  router.use('/doctors/appointments', doctorAppointmentRoutes);

  return router;
}; 