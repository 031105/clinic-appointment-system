// doctor-patients.routes.ts
import { Router } from 'express';
import {
  getDoctorPatients,
  getPatientDetails,
  addPatientNote,
  schedulePatientAppointment
} from '../controllers/doctor-patients.controller';

const router = Router();

router.get('/', getDoctorPatients);
router.get('/:patientId', getPatientDetails);
router.post('/:patientId/notes', addPatientNote);
router.post('/:patientId/appointments', schedulePatientAppointment);

export default router; 