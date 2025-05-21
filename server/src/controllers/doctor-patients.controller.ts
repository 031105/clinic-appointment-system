import { Request, Response } from 'express';
import dbClient from '../utils/db-client';
import { logger } from '../utils/logger';

// Add Appointment type
interface Appointment {
  id: number;
  date: string;
  time: string;
  type: string;
}

// Mock DB functions (replace with real DB logic)
const mockPatients = [
  {
    id: 'P1001',
    firstName: 'John',
    lastName: 'Wong',
    age: 45,
    gender: 'Male',
    nextAppointment: '2023-08-10',
    phone: '+60 12-345-6789',
    address: '123 Jalan Bukit Bintang, Kuala Lumpur',
    email: 'john.wong@example.com',
    lastVisit: '2023-07-25',
    medicalHistory: {
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg'],
      bloodType: 'A+',
    },
    notes: [
      { id: 1, text: 'Patient is maintaining a healthy diet and exercise routine. Blood sugar levels are stabilizing.' }
    ],
    appointments: [] as Appointment[],
  },
  // ... more mock patients
];

// 扩展Request类型，包含用户信息
type AuthRequest = Request & {
  user?: {
    id: number;
    email: string;
    role: string;
  }
};

/**
 * 获取当前医生的所有患者列表
 */
export const getDoctorPatients = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    logger.info(`Fetching patients for doctor ID: ${doctorId}`);

    // 查询所有与该医生有预约关系的患者（去重）
    const result = await dbClient.query(`
      SELECT DISTINCT
        p.patient_id as id,
        u.first_name,
        u.last_name,
        u.email,
        p.gender,
        p.date_of_birth,
        u.phone,
        u.address
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON p.patient_id = u.user_id
      WHERE a.doctor_id = $1
      ORDER BY u.first_name, u.last_name
    `, [doctorId]);

    return res.status(200).json(result.rows);
  } catch (error) {
    logger.error('Error in getDoctorPatients:', error);
    return res.status(500).json({ message: 'Failed to retrieve doctor patients' });
  }
};

/**
 * 获取单个患者的详细信息（基础信息、过敏史、预约历史、病历等）
 */
export const getPatientDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    logger.info(`Fetching details for patient ID: ${patientId}`);

    // 基本信息
    const patientResult = await dbClient.query(`
      SELECT 
        p.patient_id as id,
        u.first_name,
        u.last_name,
        u.email,
        p.gender,
        p.date_of_birth,
        u.phone,
        u.address
      FROM patients p
      JOIN users u ON p.patient_id = u.user_id
      WHERE p.patient_id = $1
    `, [patientId]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const patient = patientResult.rows[0];

    // 过敏史
    const allergiesResult = await dbClient.query(`
      SELECT 
        allergy_id as id,
        name,
        severity
      FROM patient_allergies
      WHERE patient_id = $1
    `, [patientId]);

    // 预约历史
    const appointmentsResult = await dbClient.query(`
      SELECT 
        appointment_id as id,
        appointment_date,
        appointment_time,
        status,
        type
      FROM appointments
      WHERE patient_id = $1
      ORDER BY appointment_date DESC, appointment_time DESC
    `, [patientId]);

    // 病历
    const medicalRecordsResult = await dbClient.query(`
      SELECT 
        record_id as id,
        record_type,
        description,
        created_at
      FROM medical_records
      WHERE patient_id = $1
      ORDER BY created_at DESC
    `, [patientId]);

    // 组装返回
    const details = {
      ...patient,
      allergies: allergiesResult.rows,
      appointments: appointmentsResult.rows,
      medicalRecords: medicalRecordsResult.rows
    };

    return res.status(200).json(details);
  } catch (error) {
    logger.error('Error in getPatientDetails:', error);
    return res.status(500).json({ message: 'Failed to retrieve patient details' });
  }
};

/**
 * 添加患者笔记（插入 medical_records）
 */
export const addPatientNote = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { text } = req.body;
    logger.info(`Adding note for patient ID: ${patientId}`);

    // notes 存在 medical_records 里，类型为 'consultation' 且 description 字段存笔记
    const result = await dbClient.query(`
      INSERT INTO medical_records (patient_id, record_type, description)
      VALUES ($1, 'consultation', $2)
      RETURNING record_id as id, description
    `, [patientId, text]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error in addPatientNote:', error);
    return res.status(500).json({ message: 'Failed to add note' });
  }
};

/**
 * 为患者安排新预约
 */
export const schedulePatientAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user!.id;
    const { date, time, type } = req.body;
    logger.info(`Scheduling appointment for patient ID: ${patientId} by doctor ID: ${doctorId}`);

    const result = await dbClient.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, status)
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING appointment_id as id, appointment_date, appointment_time, type, status
    `, [patientId, doctorId, date, time, type]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error in schedulePatientAppointment:', error);
    return res.status(500).json({ message: 'Failed to schedule appointment' });
  }
}; 