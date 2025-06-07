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
    
    if (!patientId || isNaN(Number(patientId))) {
      logger.error(`Invalid patient ID: ${patientId}`);
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    // 基本信息
    try {
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
      
      logger.info(`Patient query results: ${JSON.stringify(patientResult.rows)}`);
      
      if (patientResult.rows.length === 0) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const patient = patientResult.rows[0];
      
      // 组装返回，即使其他查询出错也至少返回基本信息
      const details = {
        ...patient,
        allergies: [],
        appointments: [],
        medicalRecords: []
      };

      try {
        // 过敏史
        const allergiesResult = await dbClient.query(`
          SELECT 
            allergy_id as id,
            name,
            severity
          FROM patient_allergies
          WHERE patient_id = $1
        `, [patientId]);
        
        details.allergies = allergiesResult.rows;
      } catch (allergyError) {
        logger.error(`Error fetching allergies: ${allergyError}`);
        // 继续执行，不中断整个请求
      }

      try {
        // 预约历史
        const appointmentsResult = await dbClient.query(`
          SELECT 
            appointment_id as id,
            appointment_datetime,
            end_datetime,
            status,
            type
          FROM appointments
          WHERE patient_id = $1 AND doctor_id = $2
          ORDER BY appointment_datetime DESC, end_datetime DESC
        `, [patientId, req.user!.id]);
        
        logger.info(`Appointments query results: ${JSON.stringify(appointmentsResult.rows)}`);
        details.appointments = appointmentsResult.rows;
      } catch (appointmentError) {
        logger.error(`Error fetching appointments: ${appointmentError}`);
        // 继续执行，不中断整个请求
      }

      try {
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
        
        details.medicalRecords = medicalRecordsResult.rows;
      } catch (recordError) {
        logger.error(`Error fetching medical records: ${recordError}`);
        // 继续执行，不中断整个请求
      }

      return res.status(200).json(details);
    } catch (patientError) {
      logger.error(`Error fetching patient basic info: ${patientError}`);
      return res.status(500).json({ message: 'Error retrieving patient basic information' });
    }
  } catch (error) {
    logger.error(`Error in getPatientDetails: ${error}`);
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
    const { appointmentDateTime, endDateTime, type } = req.body;
    logger.info(`Scheduling appointment for patient ID: ${patientId} by doctor ID: ${doctorId}`);

    const result = await dbClient.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, end_datetime, type, status)
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING appointment_id as id, appointment_datetime, end_datetime, type, status
    `, [patientId, doctorId, appointmentDateTime, endDateTime, type]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error in schedulePatientAppointment:', error);
    return res.status(500).json({ message: 'Failed to schedule appointment' });
  }
}; 