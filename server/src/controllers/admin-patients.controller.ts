import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

// Patient interface
interface Patient {
  patient_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  status: string;
  created_at: string;
  updated_at: string;
  last_visit?: string;
  allergies?: string[];
}

// Medical Record interface
interface MedicalRecord {
  record_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  date: string;
  diagnosis: string;
  prescription?: string[];
  notes?: string;
  doctor_name: string;
}

export class AdminPatientsController {

  // Get all patients with pagination, search, and filtering
  async getAllPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = 'all',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      logger.info('Getting all patients for admin', { page, limit, search, status });

      const offset = (Number(page) - 1) * Number(limit);
      const params: any[] = [];
      let whereClause = 'WHERE r.role_name = \'patient\'';

      // Add status filter
      if (status !== 'all') {
        whereClause += ` AND u.status = $${params.length + 1}`;
        params.push(status);
      }

      // Add search filter
      if (search && String(search).trim() !== '') {
        const searchTerm = `%${String(search).trim().toLowerCase()}%`;
        whereClause += ` AND (
          LOWER(u.first_name) LIKE $${params.length + 1} OR
          LOWER(u.last_name) LIKE $${params.length + 1} OR
          LOWER(u.email) LIKE $${params.length + 1} OR
          u.phone LIKE $${params.length + 1} OR
          CAST(p.patient_id AS TEXT) LIKE $${params.length + 1}
        )`;
        params.push(searchTerm);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(DISTINCT p.patient_id) as total
        FROM patients p
        JOIN users u ON p.patient_id = u.user_id
        JOIN roles r ON u.role_id = r.role_id
        ${whereClause}
      `;

      const countResult = await dbClient.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get patients with last visit information
      const query = `
        SELECT 
          p.patient_id as id,
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.address,
          p.date_of_birth,
          p.gender,
          p.blood_type,
          p.height,
          p.weight,
          u.status,
          u.created_at,
          u.updated_at,
          (
            SELECT MAX(a.appointment_datetime)
            FROM appointments a
            WHERE a.patient_id = p.patient_id
            AND a.status = 'completed'
          ) as last_visit,
          (
            SELECT COUNT(*)
            FROM patient_allergies pa
            WHERE pa.patient_id = p.patient_id
          ) as allergy_count
        FROM patients p
        JOIN users u ON p.patient_id = u.user_id
        JOIN roles r ON u.role_id = r.role_id
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(Number(limit), offset);
      const result = await dbClient.query(query, params);

      logger.info(`Retrieved ${result.rows.length} patients out of ${total} total`);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      logger.error('Failed to get all patients:', error);
      next(new ApiError(500, 'Failed to get patients'));
    }
  }

  // Get patient by ID with detailed information
  async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`Getting patient details for ID: ${id}`);

      // Get patient basic information
      const patientQuery = `
        SELECT 
          p.patient_id as id,
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.address,
          p.date_of_birth,
          p.gender,
          p.blood_type,
          p.height,
          p.weight,
          u.status,
          u.created_at as registration_date,
          u.updated_at,
          (
            SELECT MAX(a.appointment_datetime)
            FROM appointments a
            WHERE a.patient_id = p.patient_id
            AND a.status = 'completed'
          ) as last_visit
        FROM patients p
        JOIN users u ON p.patient_id = u.user_id
        WHERE p.patient_id = $1
      `;

      const patientResult = await dbClient.query(patientQuery, [id]);

      if (patientResult.rows.length === 0) {
        throw new ApiError(404, 'Patient not found');
      }

      const patient = patientResult.rows[0];

      // Get patient allergies
      const allergiesQuery = `
        SELECT 
          allergy_id as id,
          name,
          severity
        FROM patient_allergies
        WHERE patient_id = $1
      `;

      const allergiesResult = await dbClient.query(allergiesQuery, [id]);

      // Get basic stats
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM appointments WHERE patient_id = $1) as total_appointments,
          (SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'completed') as completed_appointments,
          (SELECT COUNT(*) FROM medical_records WHERE patient_id = $1) as medical_records_count
      `;

      const statsResult = await dbClient.query(statsQuery, [id]);

      const response = {
        ...patient,
        allergies: allergiesResult.rows,
        stats: statsResult.rows[0]
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      logger.error('Failed to get patient details:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to get patient details'));
      }
    }
  }

  // Get patient medical records
  async getPatientMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      logger.info(`Getting medical records for patient ID: ${id}`);

      const offset = (Number(page) - 1) * Number(limit);

      const query = `
        SELECT 
          mr.record_id as id,
          mr.patient_id,
          mr.doctor_id,
          mr.appointment_id,
          mr.diagnosis,
          mr.prescription,
          mr.notes,
          mr.date_of_record as date,
          mr.created_at,
          mr.updated_at,
          CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
          a.appointment_datetime,
          a.type as appointment_type
        FROM medical_records mr
        JOIN users du ON mr.doctor_id = du.user_id
        LEFT JOIN appointments a ON mr.appointment_id = a.appointment_id
        WHERE mr.patient_id = $1
        ORDER BY mr.date_of_record DESC, mr.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await dbClient.query(query, [id, Number(limit), offset]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM medical_records
        WHERE patient_id = $1
      `;

      const countResult = await dbClient.query(countQuery, [id]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      logger.error('Failed to get patient medical records:', error);
      next(new ApiError(500, 'Failed to get medical records'));
    }
  }

  // Create new patient (admin quick registration)
  async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address = '',
        bloodType = null,
        height = null,
        weight = null,
        allergies = []
      } = req.body;

      logger.info(`Creating new patient: ${firstName} ${lastName}`);

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender) {
        throw new ApiError(400, 'Missing required fields: firstName, lastName, email, phone, dateOfBirth, gender');
      }

      // Check if email already exists
      const emailCheckQuery = `
        SELECT user_id FROM users WHERE email = $1
      `;
      const emailCheckResult = await dbClient.query(emailCheckQuery, [email]);

      if (emailCheckResult.rows.length > 0) {
        throw new ApiError(409, 'Email already exists');
      }

      // Generate a temporary password (patient can change it later)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Start transaction
      await dbClient.query('BEGIN');

      try {
        // Insert user
        const userQuery = `
          INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, address, status, created_at, updated_at)
          VALUES (3, $1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
          RETURNING user_id
        `;

        const userResult = await dbClient.query(userQuery, [
          email,
          hashedPassword,
          firstName,
          lastName,
          phone,
          address
        ]);

        const userId = userResult.rows[0].user_id;

        // Insert patient
        const patientQuery = `
          INSERT INTO patients (patient_id, date_of_birth, gender, blood_type, height, weight, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING patient_id
        `;

        const patientResult = await dbClient.query(patientQuery, [
          userId,
          dateOfBirth,
          gender,
          bloodType,
          height,
          weight
        ]);

        const patientId = patientResult.rows[0].patient_id;

        // Insert allergies if provided
        if (allergies && allergies.length > 0) {
          for (const allergy of allergies) {
            const allergyQuery = `
              INSERT INTO patient_allergies (patient_id, name, severity, created_at, updated_at)
              VALUES ($1, $2, $3, NOW(), NOW())
            `;
            await dbClient.query(allergyQuery, [patientId, allergy.name, allergy.severity || 'mild']);
          }
        }

        await dbClient.query('COMMIT');

        logger.info(`Patient created successfully with ID: ${patientId}`);

        res.status(201).json({
          success: true,
          message: 'Patient created successfully',
          data: {
            id: patientId,
            user_id: userId,
            temp_password: tempPassword, // Return temp password for admin to give to patient
            email: email
          }
        });

      } catch (error) {
        await dbClient.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      logger.error('Failed to create patient:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to create patient'));
      }
    }
  }

  // Update patient status
  async updatePatientStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      logger.info(`Updating patient status for ID: ${id} to: ${status}`);

      if (!['active', 'inactive'].includes(status)) {
        throw new ApiError(400, 'Invalid status. Must be "active" or "inactive"');
      }

      const query = `
        UPDATE users 
        SET status = $1, updated_at = NOW()
        WHERE user_id = (SELECT patient_id FROM patients WHERE patient_id = $2)
        RETURNING user_id
      `;

      const result = await dbClient.query(query, [status, id]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Patient not found');
      }

      res.json({
        success: true,
        message: 'Patient status updated successfully'
      });

    } catch (error) {
      logger.error('Failed to update patient status:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to update patient status'));
      }
    }
  }

  // Add medical record for patient
  async addMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { doctorId, diagnosis, prescription, notes, recordDate } = req.body;

      logger.info(`Adding medical record for patient ID: ${id}`);

      if (!doctorId || !diagnosis) {
        throw new ApiError(400, 'Missing required fields: doctorId, diagnosis');
      }

      const query = `
        INSERT INTO medical_records 
        (patient_id, doctor_id, record_type, title, description, diagnosis, prescription, notes, date_of_record, created_at, updated_at)
        VALUES ($1, $2, 'consultation', 'Admin Added Record', 'Record added by admin', $3, $4, $5, $6, NOW(), NOW())
        RETURNING record_id
      `;

      const result = await dbClient.query(query, [
        id,
        doctorId,
        diagnosis,
        prescription ? [prescription] : null,
        notes || '',
        recordDate || new Date().toISOString().split('T')[0]
      ]);

      res.status(201).json({
        success: true,
        message: 'Medical record added successfully',
        data: { record_id: result.rows[0].record_id }
      });

    } catch (error) {
      logger.error('Failed to add medical record:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to add medical record'));
      }
    }
  }
}

export default new AdminPatientsController(); 