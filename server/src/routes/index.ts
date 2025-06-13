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
import doctorMedicalRecordsRoutes from './doctor-medical-records.routes';
import adminDepartmentsRoutes from './admin-departments.routes';
import adminUsersRoutes from './admin-users.routes';
import adminPatientsRoutes from './admin-patients.routes';
import adminAppointmentsRoutes from './admin-appointments.routes';
import adminDashboardRoutes from './admin-dashboard.routes';
import adminSettingsRoutes from './admin-settings.routes';
import adminSettingRoutes from './admin-setting.routes';
import adminMedicalRecordsRoutes from './admin-medical-records.routes';
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

  // Dashboard routes - separate public and protected routes
  router.use('/dashboard', dashboardRoutes);
  
  // Appointment routes
  router.use('/appointments', appointmentRoutes);

  // Patient routes
  router.use('/patients', patientRoutes);

  // Patient personal settings routes
  logger.info('Registering patient personal settings routes: /patient-setting');
  router.use('/patient-setting', patientSettingRoutes);

  // Medical records routes
  logger.info('Registering medical records routes: /medical-records');
  router.use('/medical-records', authenticate, medicalRecordRoutes);

  // Doctor appointment management routes
  logger.info('Registering doctor appointment management routes: /doctors/appointments');
  router.use('/doctors/appointments', doctorAppointmentRoutes);

  // Doctor patient management routes
  logger.info('Registering doctor patient management routes: /doctor-patients');
  router.use('/doctor-patients', authenticate, doctorPatientsRoutes);

  // Doctor personal settings routes
  logger.info('Registering doctor personal settings routes: /doctor-setting');
  router.use('/doctor-setting', authenticate, doctorSettingRoutes);

  // Doctor medical records routes
  logger.info('Registering doctor medical records routes: /doctors/medical-records');
  router.use('/doctors/medical-records', authenticate, doctorMedicalRecordsRoutes);

  // Doctor dashboard routes
  logger.info('Registering doctor dashboard routes: /doctors/dashboard');
  router.use('/doctors/dashboard', authenticate, doctorDashboardRoutes);

  // Admin departments routes
  logger.info('Registering admin department management routes: /admin/departments');
  router.use('/admin/departments', authenticate, adminDepartmentsRoutes);

  // Admin users routes
  logger.info('Registering admin user management routes: /admin/users');
  router.use('/admin/users', authenticate, adminUsersRoutes);

  // Admin patients routes
  logger.info('Registering admin patient management routes: /admin/patients');
  router.use('/admin/patients', authenticate, adminPatientsRoutes);

  // Admin appointments routes
  logger.info('Registering admin appointment management routes: /admin/appointments');
  router.use('/admin/appointments', authenticate, adminAppointmentsRoutes);

  // Admin medical records routes
  logger.info('Registering admin medical records routes: /admin/medical-records');
  router.use('/admin/medical-records', authenticate, adminMedicalRecordsRoutes);

  // Admin dashboard routes
  logger.info('Registering admin dashboard routes: /admin/dashboard');
  router.use('/admin/dashboard', authenticate, adminDashboardRoutes);

  // Admin settings routes
  logger.info('Registering admin settings routes: /admin/settings');
  router.use('/admin/settings', authenticate, adminSettingsRoutes);

  // Admin setting routes (alternative)
  logger.info('Registering admin setting routes (alternative): /admin/setting');
  router.use('/admin/setting', authenticate, adminSettingRoutes);

  return router;
};

export default setupRoutes(); 