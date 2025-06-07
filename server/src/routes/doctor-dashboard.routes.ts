import { Router } from 'express';
import { getDashboardStats, getTodayAppointments } from '../controllers/doctor-dashboard.controller';
import { authenticate } from '../middleware/auth';
import { validateDoctorRole } from '../middleware/role-validator';

const router = Router();

// Apply authentication and doctor role validation middleware
router.use(authenticate);
router.use(validateDoctorRole);

// Dashboard routes
router.get('/', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/today-appointments', getTodayAppointments);

export default router; 