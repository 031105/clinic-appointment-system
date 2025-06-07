import { Router } from 'express';
import adminAppointmentsController from '../controllers/admin-appointments.controller';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// Add authentication and admin role check for all routes
router.use(authenticate);
router.use(checkRole(['admin']));

// Get all appointments with filtering and pagination (for list view)
router.get('/', adminAppointmentsController.getAllAppointments);

// Get calendar appointments for a specific date range
router.get('/calendar', adminAppointmentsController.getCalendarAppointments);

// Get departments and doctors for dropdowns
router.get('/data/departments-doctors', adminAppointmentsController.getDepartmentsAndDoctors);

// Get dynamic color assignments for calendar
router.get('/data/color-assignments', adminAppointmentsController.getColorAssignments);

// Get filter options (status, types, etc.)
router.get('/data/filter-options', adminAppointmentsController.getFilterOptions);

// Get appointment by ID
router.get('/:id', adminAppointmentsController.getAppointmentById);

// Create new appointment
router.post('/', adminAppointmentsController.createAppointment);

// Update appointment status
router.patch('/:id/status', adminAppointmentsController.updateAppointmentStatus);

export default router; 