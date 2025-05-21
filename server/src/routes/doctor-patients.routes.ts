// doctor-patients.routes.ts
import { Router } from 'express';
import {
  getDoctorPatients,
  getPatientDetails,
  addPatientNote,
  schedulePatientAppointment
} from '../controllers/doctor-patients.controller';

const router = Router();

router.get('/doctor-patients', getDoctorPatients);
router.get('/doctor-patients/:patientId', getPatientDetails);
router.post('/doctor-patients/:patientId/notes', addPatientNote);
router.post('/doctor-patients/:patientId/appointments', schedulePatientAppointment);

export default router; 