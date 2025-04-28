import { Router } from 'express';
import { MedicalRecordController } from '../controllers/medicalRecord.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from '../schemas/medicalRecord.schema';

const router = Router();
const medicalRecordController = new MedicalRecordController();

// Create a new medical record (doctors only)
router.post(
  '/',
  authorize('doctor'),
  validateRequest(createMedicalRecordSchema),
  medicalRecordController.createMedicalRecord
);

// Update an existing medical record (doctors only)
router.patch(
  '/:id',
  authorize('doctor'),
  validateRequest(updateMedicalRecordSchema),
  medicalRecordController.updateMedicalRecord
);

// Get a specific medical record by ID (doctors, patients, admins)
router.get(
  '/:id',
  medicalRecordController.getMedicalRecordById
);

// Get all medical records for a specific patient (doctors, the patient, admins)
router.get(
  '/patient/:patientId',
  medicalRecordController.getPatientMedicalRecords
);

// Get all medical records created by a specific doctor (that doctor, admins)
router.get(
  '/doctor/:doctorId',
  medicalRecordController.getDoctorMedicalRecords
);

export default router; 