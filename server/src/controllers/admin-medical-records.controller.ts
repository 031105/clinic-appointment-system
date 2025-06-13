import { Request, Response, NextFunction } from 'express';
import dbClient from '../config/database';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface AdminMedicalRecord {
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
  doctor: {
    id: number;
    firstName: string;
    lastName: string;
    specialty: string;
    department: string;
  };
  appointment: {
    id: number;
    dateTime: string;
    type: string;
    status: string;
  } | null;
}

/**
 * Get all medical records with admin privileges
 */
export const getAdminMedicalRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      patientId, 
      doctorId, 
      departmentId,
      dateFrom, 
      dateTo 
    } = req.query;

    logger.info('Getting all medical records for admin');

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (
        LOWER(p.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(p.last_name) LIKE LOWER($${paramCount}) OR 
        LOWER(d.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(d.last_name) LIKE LOWER($${paramCount}) OR 
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

    // Add doctor filter
    if (doctorId) {
      paramCount++;
      whereClause += ` AND mr.doctor_id = $${paramCount}`;
      params.push(doctorId);
    }

    // Add department filter
    if (departmentId) {
      paramCount++;
      whereClause += ` AND doc.department_id = $${paramCount}`;
      params.push(departmentId);
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
        d.first_name as "doctorFirstName",
        d.last_name as "doctorLastName",
        doc.specialty as "doctorSpecialty",
        dept.name as "departmentName",
        a.appointment_datetime as "appointmentDateTime",
        a.type as "appointmentType",
        a.status as "appointmentStatus"
      FROM medical_records mr
      JOIN users p ON mr.patient_id = p.user_id
      JOIN users d ON mr.doctor_id = d.user_id
      LEFT JOIN patients pat ON mr.patient_id = pat.patient_id
      LEFT JOIN doctors doc ON mr.doctor_id = doc.doctor_id
      LEFT JOIN departments dept ON doc.department_id = dept.department_id
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
      JOIN users d ON mr.doctor_id = d.user_id
      LEFT JOIN doctors doc ON mr.doctor_id = doc.doctor_id
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await dbClient.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format the response data
    const formattedRecords: AdminMedicalRecord[] = result.rows.map((record: any) => ({
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
      doctor: {
        id: record.doctorId,
        firstName: record.doctorFirstName,
        lastName: record.doctorLastName,
        specialty: record.doctorSpecialty || 'N/A',
        department: record.departmentName || 'N/A'
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
    logger.error('Failed to get admin medical records:', error);
    next(new ApiError(500, 'Failed to get medical records'));
  }
};

/**
 * Get statistics for all medical records (admin view)
 */
export const getAdminMedicalRecordsStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Getting medical records statistics for admin');

    const statsQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN DATE(mr.created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as records_this_month,
        COUNT(CASE WHEN DATE(mr.created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as records_this_week,
        COUNT(DISTINCT mr.patient_id) as total_patients,
        COUNT(DISTINCT mr.doctor_id) as total_doctors,
        COUNT(CASE WHEN mr.prescription IS NOT NULL AND mr.prescription != '[]' THEN 1 END) as records_with_prescription
      FROM medical_records mr
    `;

    const departmentStatsQuery = `
      SELECT 
        dept.name as department_name,
        COUNT(mr.record_id) as department_records
      FROM medical_records mr
      JOIN doctors doc ON mr.doctor_id = doc.doctor_id
      JOIN departments dept ON doc.department_id = dept.department_id
      GROUP BY dept.department_id, dept.name
      ORDER BY department_records DESC
      LIMIT 5
    `;

    const topDoctorsQuery = `
      SELECT 
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        COUNT(mr.record_id) as record_count
      FROM medical_records mr
      JOIN users d ON mr.doctor_id = d.user_id
      GROUP BY mr.doctor_id, d.first_name, d.last_name
      ORDER BY record_count DESC
      LIMIT 5
    `;

    const [statsResult, departmentResult, doctorResult] = await Promise.all([
      dbClient.query(statsQuery),
      dbClient.query(departmentStatsQuery),
      dbClient.query(topDoctorsQuery)
    ]);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        overview: {
          totalRecords: parseInt(stats.total_records),
          recordsThisMonth: parseInt(stats.records_this_month),
          recordsThisWeek: parseInt(stats.records_this_week),
          totalPatients: parseInt(stats.total_patients),
          totalDoctors: parseInt(stats.total_doctors),
          recordsWithPrescription: parseInt(stats.records_with_prescription)
        },
        departmentStats: departmentResult.rows.map(row => ({
          departmentName: row.department_name,
          recordCount: parseInt(row.department_records)
        })),
        topDoctors: doctorResult.rows.map(row => ({
          doctorName: row.doctor_name,
          recordCount: parseInt(row.record_count)
        }))
      }
    });

  } catch (error) {
    logger.error('Failed to get admin medical records statistics:', error);
    next(new ApiError(500, 'Failed to get medical records statistics'));
  }
}; 