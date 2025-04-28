import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import doctorRoutes from './doctor.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';
import departmentRoutes from './department.routes';
import reviewRoutes from './review.routes';
import medicalRecordRoutes from './medicalRecord.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';
import reportRoutes from './report.routes';
import { authenticate } from '../middleware/auth';

export const setupRoutes = () => {
  const router = Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes (public)
  router.use('/auth', authRoutes);

  // Protected routes
  router.use('/users', authenticate, userRoutes);
  router.use('/doctors', authenticate, doctorRoutes);
  router.use('/patients', authenticate, patientRoutes);
  router.use('/appointments', authenticate, appointmentRoutes);
  router.use('/departments', authenticate, departmentRoutes);
  router.use('/reviews', authenticate, reviewRoutes);
  router.use('/medical-records', authenticate, medicalRecordRoutes);
  router.use('/notifications', authenticate, notificationRoutes);
  router.use('/admin', authenticate, adminRoutes);
  router.use('/reports', authenticate, reportRoutes);

  return router;
}; 