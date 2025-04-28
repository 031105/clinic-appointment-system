import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from '../schemas/appointment.schema';

const router = Router();
const appointmentController = new AppointmentController();

// Create new appointment
router.post(
  '/',
  authorize('patient'),
  validateRequest(createAppointmentSchema),
  appointmentController.createAppointment
);

// Get all appointments (filtered by user role)
router.get(
  '/',
  appointmentController.getAppointments
);

// Get appointment by ID
router.get(
  '/:id',
  appointmentController.getAppointmentById
);

// Update appointment status (cancel, complete, etc.)
router.patch(
  '/:id/status',
  validateRequest(updateAppointmentStatusSchema),
  appointmentController.updateAppointmentStatus
);

export default router; 