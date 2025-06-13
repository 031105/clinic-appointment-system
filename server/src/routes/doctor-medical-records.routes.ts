import { Router } from 'express';
import { getDoctorMedicalRecords, getDoctorMedicalRecordsStats } from '../controllers/doctor-medical-records.controller';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// Add authentication and doctor role check for all routes
router.use(authenticate);
router.use(checkRole(['doctor']));

// Get all medical records created by the doctor
router.get('/', getDoctorMedicalRecords);

// Get statistics for doctor's medical records
router.get('/stats', getDoctorMedicalRecordsStats);

export default router; 