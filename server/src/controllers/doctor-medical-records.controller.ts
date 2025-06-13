import { Request, Response, NextFunction } from 'express';
import dbClient from '../config/database';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface FormattedMedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number | null;
  diagnosis: string;
  prescription: any;
  notes: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  appointment: {
    id: number;
    dateTime: string;
    type: string;
    status: string;
  } | null;
}

/**
 * Get all medical records created by the doctor
 */
export const getDoctorMedicalRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user?.id;
    const { page = 1, limit = 20, search, patientId, dateFrom, dateTo } = req.query;

    if (!doctorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    logger.info(`Getting medical records for doctor ID: ${doctorId}`);

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE mr.doctor_id = $1';
    const params: any[] = [doctorId];
    let paramCount = 1;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (
        LOWER(p.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(p.last_name) LIKE LOWER($${paramCount}) OR 
        LOWER(mr.diagnosis) LIKE LOWER($${paramCount}) OR
        LOWER(mr.notes) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    // Add patient filter
    if (patientId) {
      paramCount++;
      whereClause += ` AND mr.patient_id = $${paramCount}`;
      params.push(patientId);
    }

    // Add date range filter
    if (dateFrom) {
      paramCount++;
      whereClause += ` AND DATE(mr.created_at) >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND DATE(mr.created_at) <= $${paramCount}`;
      params.push(dateTo);
    }

    const query = `
      SELECT 
        mr.record_id as id,
        mr.patient_id as "patientId",
        mr.doctor_id as "doctorId",
        mr.appointment_id as "appointmentId",
        mr.diagnosis,
        mr.prescription,
        mr.notes,
        mr.created_at as "createdAt",
        mr.updated_at as "updatedAt",
        p.first_name as "patientFirstName",
        p.last_name as "patientLastName",
        p.email as "patientEmail",
        p.phone as "patientPhone",
        pat.date_of_birth as "patientDateOfBirth",
        a.appointment_datetime as "appointmentDateTime",
        a.type as "appointmentType",
        a.status as "appointmentStatus"
      FROM medical_records mr
      JOIN users p ON mr.patient_id = p.user_id
      LEFT JOIN patients pat ON mr.patient_id = pat.patient_id
      LEFT JOIN appointments a ON mr.appointment_id = a.appointment_id
      ${whereClause}
      ORDER BY mr.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(Number(limit), offset);

    const result = await dbClient.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM medical_records mr
      JOIN users p ON mr.patient_id = p.user_id
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await dbClient.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format the response data
    const formattedRecords: FormattedMedicalRecord[] = result.rows.map((record: any) => ({
      id: record.id,
      patientId: record.patientId,
      doctorId: record.doctorId,
      appointmentId: record.appointmentId,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      patient: {
        id: record.patientId,
        firstName: record.patientFirstName,
        lastName: record.patientLastName,
        email: record.patientEmail,
        phone: record.patientPhone,
        dateOfBirth: record.patientDateOfBirth
      },
      appointment: record.appointmentId ? {
        id: record.appointmentId,
        dateTime: record.appointmentDateTime,
        type: record.appointmentType,
        status: record.appointmentStatus
      } : null
    }));

    res.json({
      success: true,
      data: formattedRecords,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    logger.error('Failed to get doctor medical records:', error);
    next(new ApiError(500, 'Failed to get medical records'));
  }
};

/**
 * Get statistics for doctor's medical records
 */
export const getDoctorMedicalRecordsStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user?.id;

    if (!doctorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    logger.info(`Getting medical records stats for doctor ID: ${doctorId}`);

    const statsQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN DATE(mr.created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as records_this_month,
        COUNT(CASE WHEN DATE(mr.created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as records_this_week,
        COUNT(DISTINCT mr.patient_id) as unique_patients,
        COUNT(CASE WHEN mr.prescription IS NOT NULL AND mr.prescription != '[]' THEN 1 END) as records_with_prescription
      FROM medical_records mr
      WHERE mr.doctor_id = $1
    `;

    const result = await dbClient.query(statsQuery, [doctorId]);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        totalRecords: parseInt(stats.total_records),
        recordsThisMonth: parseInt(stats.records_this_month),
        recordsThisWeek: parseInt(stats.records_this_week),
        uniquePatients: parseInt(stats.unique_patients),
        recordsWithPrescription: parseInt(stats.records_with_prescription)
      }
    });

  } catch (error) {
    logger.error('Failed to get doctor medical records stats:', error);
    next(new ApiError(500, 'Failed to get medical records statistics'));
  }
}; 