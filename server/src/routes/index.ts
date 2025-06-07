import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import appointmentRoutes from './appointment.routes';
import patientRoutes from './patient.routes';
import patientSettingRoutes from './patient-setting.routes';
import medicalRecordRoutes from './medical-record.routes';
import doctorAppointmentRoutes from './doctor-appointment.routes';
import doctorPatientsRoutes from './doctor-patients.routes';
import doctorSettingRoutes from './doctor-setting.routes';
import adminDepartmentsRoutes from './admin-departments.routes';
import adminUsersRoutes from './admin-users.routes';
import adminPatientsRoutes from './admin-patients.routes';
import adminAppointmentsRoutes from './admin-appointments.routes';
import adminDashboardRoutes from './admin-dashboard.routes';
import adminSettingsRoutes from './admin-settings.routes';
import adminSettingRoutes from './admin-setting.routes';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import doctorDashboardRoutes from './doctor-dashboard.routes';

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

  // 医生患者管理路由
  logger.info('注册医生患者管理路由: /doctor-patients');
  router.use('/doctor-patients', authenticate, doctorPatientsRoutes);

  // 医生个人设置路由
  logger.info('注册医生个人设置路由: /doctor-setting');
  router.use('/doctor-setting', authenticate, doctorSettingRoutes);

  // Doctor dashboard routes
  logger.info('注册医生仪表盘路由: /doctors/dashboard');
  router.use('/doctors/dashboard', authenticate, doctorDashboardRoutes);

  // Admin departments routes
  logger.info('注册管理员部门管理路由: /admin/departments');
  router.use('/admin/departments', authenticate, adminDepartmentsRoutes);

  // Admin users routes
  logger.info('注册管理员用户管理路由: /admin/users');
  router.use('/admin/users', authenticate, adminUsersRoutes);

  // Admin patients routes
  logger.info('注册管理员患者管理路由: /admin/patients');
  router.use('/admin/patients', authenticate, adminPatientsRoutes);

  // Admin appointments routes
  logger.info('注册管理员预约管理路由: /admin/appointments');
  router.use('/admin/appointments', authenticate, adminAppointmentsRoutes);

  // Admin dashboard routes
  logger.info('注册管理员仪表盘路由: /admin/dashboard');
  router.use('/admin/dashboard', authenticate, adminDashboardRoutes);

  // Admin settings routes
  logger.info('注册管理员设置管理路由: /admin/settings');
  router.use('/admin/settings', authenticate, adminSettingsRoutes);

  // Admin profile and personal settings routes
  logger.info('注册管理员个人设置路由: /admin-setting');
  router.use('/admin-setting', authenticate, adminSettingRoutes);

  return router;
};

export default setupRoutes(); 