import { Router } from 'express';
import adminPatientsController from '../controllers/admin-patients.controller';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// Add authentication and admin role check for all routes
router.use(authenticate);
router.use(checkRole(['admin']));

// Get all patients with pagination, search, and filtering
router.get('/', adminPatientsController.getAllPatients);

// Get patient by ID with detailed information
router.get('/:id', adminPatientsController.getPatientById);

// Get patient medical records
router.get('/:id/medical-records', adminPatientsController.getPatientMedicalRecords);

// Create new patient (admin quick registration)
router.post('/', adminPatientsController.createPatient);

// Update patient status
router.patch('/:id/status', adminPatientsController.updatePatientStatus);

// Add medical record for patient
router.post('/:id/medical-records', adminPatientsController.addMedicalRecord);

export default router; 