import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authorize } from '../middleware/auth';

const router = Router();
const reportController = new ReportController();

// Get appointment statistics by department
router.get(
  '/appointments-by-department',
  authorize('admin'),
  reportController.getAppointmentsByDepartment
);

// Get doctor performance report
router.get(
  '/doctor-performance',
  authorize('admin'),
  reportController.getDoctorPerformance
);

// Get revenue report
router.get(
  '/revenue',
  authorize('admin'),
  reportController.getRevenueReport
);

// Get patient demographics
router.get(
  '/patient-demographics',
  authorize('admin'),
  reportController.getPatientDemographics
);

// Get appointment trends
router.get(
  '/appointment-trends',
  authorize('admin'),
  reportController.getAppointmentTrends
);

export default router; 