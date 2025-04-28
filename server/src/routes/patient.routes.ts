import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  updatePatientProfileSchema,
  addAllergySchema,
  updateAllergySchema,
  addEmergencyContactSchema,
  updateEmergencyContactSchema,
} from '../schemas/patient.schema';

const router = Router();
const patientController = new PatientController();

// Profile management
router.get(
  '/profile',
  authorize('patient'),
  patientController.getProfile
);

router.patch(
  '/profile',
  authorize('patient'),
  validateRequest(updatePatientProfileSchema),
  patientController.updateProfile
);

// Medical records
router.get(
  '/medical-records',
  authorize('patient'),
  patientController.getMedicalRecords
);

// Allergy management
router.post(
  '/allergies',
  authorize('patient'),
  validateRequest(addAllergySchema),
  patientController.addAllergy
);

router.patch(
  '/allergies/:id',
  authorize('patient'),
  validateRequest(updateAllergySchema),
  patientController.updateAllergy
);

router.delete(
  '/allergies/:id',
  authorize('patient'),
  patientController.deleteAllergy
);

// Emergency contact management
router.post(
  '/emergency-contacts',
  authorize('patient'),
  validateRequest(addEmergencyContactSchema),
  patientController.addEmergencyContact
);

router.patch(
  '/emergency-contacts/:id',
  authorize('patient'),
  validateRequest(updateEmergencyContactSchema),
  patientController.updateEmergencyContact
);

router.delete(
  '/emergency-contacts/:id',
  authorize('patient'),
  patientController.deleteEmergencyContact
);

export default router; 