import { Router } from 'express';
import { getAdminMedicalRecords, getAdminMedicalRecordsStats } from '../controllers/admin-medical-records.controller';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// Add authentication and admin role check for all routes
router.use(authenticate);
router.use(checkRole(['admin']));

// Get all medical records with admin privileges
router.get('/', getAdminMedicalRecords);

// Get statistics for all medical records
router.get('/stats', getAdminMedicalRecordsStats);

export default router; 