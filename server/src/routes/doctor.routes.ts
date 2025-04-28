import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  updateScheduleSchema,
  addUnavailableTimeSchema,
} from '../schemas/doctor.schema';

const router = Router();
const doctorController = new DoctorController();

// Get all doctors (public)
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID (public)
router.get('/:id', doctorController.getDoctorById);

// Get doctor's schedule (public)
router.get('/:id/schedule', doctorController.getDoctorSchedule);

// Update doctor's schedule (doctor only)
router.put(
  '/schedule',
  authorize('doctor'),
  validateRequest(updateScheduleSchema),
  doctorController.updateSchedule
);

// Add unavailable time (doctor only)
router.post(
  '/unavailable-time',
  authorize('doctor'),
  validateRequest(addUnavailableTimeSchema),
  doctorController.addUnavailableTime
);

// Remove unavailable time (doctor only)
router.delete(
  '/unavailable-time/:id',
  authorize('doctor'),
  doctorController.removeUnavailableTime
);

export default router; 