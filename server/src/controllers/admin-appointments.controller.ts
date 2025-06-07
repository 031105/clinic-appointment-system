import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { logger } from '../utils/logger';

// Appointment interfaces
interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  department_id: number;
  appointment_datetime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_name: string;
  doctor_specialty: string;
  department_name: string;
}

interface CalendarAppointment extends Appointment {
  is_emergency?: boolean;
  is_long_appointment?: boolean;
  has_conflicts?: boolean;
  conflict_type?: string;
}

interface CreateAppointmentRequest {
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  type?: string;
  notes?: string;
}

export class AdminAppointmentsController {

  // Get all appointments with filtering and pagination (for list view)
  async getAllAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        department_id = '',
        doctor_id = '',
        status = '',
        date_from = '',
        date_to = '',
        sortBy = 'appointment_datetime',
        sortOrder = 'ASC'
      } = req.query;

      logger.info('Getting all appointments for admin', { page, limit, search, department_id, doctor_id, status });

      // Fixed date for consistent data display: 2025-05-28 (Wednesday)
      const FIXED_DATE = '2025-05-28';

      const offset = (Number(page) - 1) * Number(limit);
      const params: any[] = [];
      let whereClause = `WHERE DATE(a.appointment_datetime) >= DATE '${FIXED_DATE}'`; // Only show today and future appointments

      // Add search filter
      if (search && String(search).trim() !== '') {
        const searchTerm = `%${String(search).trim().toLowerCase()}%`;
        whereClause += ` AND (
          LOWER(CONCAT(pu.first_name, ' ', pu.last_name)) LIKE $${params.length + 1} OR
          LOWER(CONCAT(du.first_name, ' ', du.last_name)) LIKE $${params.length + 1} OR
          LOWER(pu.email) LIKE $${params.length + 1} OR
          pu.phone LIKE $${params.length + 1} OR
          CAST(a.appointment_id AS TEXT) LIKE $${params.length + 1}
        )`;
        params.push(searchTerm);
      }

      // Add department filter
      if (department_id && department_id !== '') {
        whereClause += ` AND d.department_id = $${params.length + 1}`;
        params.push(Number(department_id));
      }

      // Add doctor filter
      if (doctor_id && doctor_id !== '') {
        whereClause += ` AND a.doctor_id = $${params.length + 1}`;
        params.push(Number(doctor_id));
      }

      // Add status filter
      if (status && status !== '') {
        whereClause += ` AND a.status = $${params.length + 1}`;
        params.push(status);
      }

      // Add date range filter (these will override the default future-only filter)
      if (date_from && date_from !== '') {
        whereClause = whereClause.replace(`DATE(a.appointment_datetime) >= DATE '${FIXED_DATE}'`, `DATE(a.appointment_datetime) >= $${params.length + 1}`);
        params.push(date_from);
      }

      if (date_to && date_to !== '') {
        whereClause += ` AND DATE(a.appointment_datetime) <= $${params.length + 1}`;
        params.push(date_to);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM appointments a
        JOIN users pu ON a.patient_id = pu.user_id
        JOIN users du ON a.doctor_id = du.user_id
        JOIN doctors doc ON a.doctor_id = doc.doctor_id
        JOIN departments d ON doc.department_id = d.department_id
        ${whereClause}
      `;

      const countResult = await dbClient.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get appointments
      const query = `
        SELECT 
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_datetime,
          a.status,
          a.type,
          a.notes,
          a.created_at,
          a.updated_at,
          CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
          pu.email as patient_email,
          pu.phone as patient_phone,
          CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
          doc.specialty as doctor_specialty,
          d.department_id,
          d.name as department_name
        FROM appointments a
        JOIN users pu ON a.patient_id = pu.user_id
        JOIN users du ON a.doctor_id = du.user_id
        JOIN doctors doc ON a.doctor_id = doc.doctor_id
        JOIN departments d ON doc.department_id = d.department_id
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(Number(limit), offset);
      const result = await dbClient.query(query, params);

      logger.info(`Retrieved ${result.rows.length} appointments out of ${total} total`);

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
      logger.error('Failed to get all appointments:', error);
      next(new ApiError(500, 'Failed to get appointments'));
    }
  }

  // Get calendar appointments for a specific date range
  async getCalendarAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        date_from,
        date_to,
        view = 'month' // month, week, day
      } = req.query;

      logger.info('Getting calendar appointments', { date_from, date_to, view });

      if (!date_from || !date_to) {
        throw new ApiError(400, 'date_from and date_to are required');
      }

      const query = `
        SELECT 
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_datetime,
          a.end_datetime,
          a.duration,
          a.status,
          a.type,
          a.notes,
          CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
          pu.email as patient_email,
          pu.phone as patient_phone,
          CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
          doc.specialty as doctor_specialty,
          d.department_id,
          d.name as department_name
        FROM appointments a
        JOIN users pu ON a.patient_id = pu.user_id
        JOIN users du ON a.doctor_id = du.user_id
        JOIN doctors doc ON a.doctor_id = doc.doctor_id
        JOIN departments d ON doc.department_id = d.department_id
        WHERE DATE(a.appointment_datetime) >= $1
        AND DATE(a.appointment_datetime) <= $2
        ORDER BY a.appointment_datetime ASC
      `;

      const result = await dbClient.query(query, [date_from, date_to]);

      // Process appointments for calendar view
      const appointments: CalendarAppointment[] = result.rows.map(row => {
        const appointment: CalendarAppointment = {
          appointment_id: row.appointment_id,
          patient_id: row.patient_id,
          doctor_id: row.doctor_id,
          department_id: row.department_id,
          appointment_datetime: row.appointment_datetime,
          status: row.status,
          type: row.type,
          notes: row.notes,
          created_at: row.created_at,
          updated_at: row.updated_at,
          patient_name: row.patient_name,
          patient_email: row.patient_email,
          patient_phone: row.patient_phone,
          doctor_name: row.doctor_name,
          doctor_specialty: row.doctor_specialty,
          department_name: row.department_name
        };

        // Add special flags for calendar display
        const appointmentTime = new Date(row.appointment_datetime);
        const hour = appointmentTime.getHours();
        
        appointment.is_emergency = row.type === 'emergency';
        appointment.is_long_appointment = row.duration && row.duration > 60;
        
        return appointment;
      });

      logger.info(`Retrieved ${appointments.length} calendar appointments`);

      res.json({
        success: true,
        data: {
          appointments,
          view_type: view,
          date_range: {
            from: date_from,
            to: date_to
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get calendar appointments:', error);
      next(new ApiError(500, 'Failed to get calendar appointments'));
    }
  }

  // Get appointment by ID
  async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`Getting appointment details for ID: ${id}`);

      const query = `
        SELECT 
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_datetime,
          a.status,
          a.type,
          a.notes,
          a.created_at,
          a.updated_at,
          CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
          pu.email as patient_email,
          pu.phone as patient_phone,
          CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
          doc.specialty as doctor_specialty,
          d.department_id,
          d.name as department_name
        FROM appointments a
        JOIN users pu ON a.patient_id = pu.user_id
        JOIN users du ON a.doctor_id = du.user_id
        JOIN doctors doc ON a.doctor_id = doc.doctor_id
        JOIN departments d ON doc.department_id = d.department_id
        WHERE a.appointment_id = $1
      `;

      const result = await dbClient.query(query, [id]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Appointment not found');
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      logger.error('Failed to get appointment details:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to get appointment details'));
      }
    }
  }

  // Create new appointment
  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        type = 'consultation',
        notes = ''
      } = req.body as CreateAppointmentRequest;

      logger.info('Creating new appointment', { patient_id, doctor_id, appointment_date, appointment_time });

      // Validate required fields
      if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
        throw new ApiError(400, 'Missing required fields: patient_id, doctor_id, appointment_date, appointment_time');
      }

      // Combine date and time
      const appointment_datetime = `${appointment_date} ${appointment_time}`;

      // Check if doctor is available at this time
      const conflictQuery = `
        SELECT appointment_id FROM appointments 
        WHERE doctor_id = $1 
        AND DATE(appointment_datetime) = $2 
        AND appointment_datetime = $3
        AND status NOT IN ('cancelled')
      `;

      const conflictResult = await dbClient.query(conflictQuery, [
        doctor_id,
        appointment_date,
        appointment_datetime
      ]);

      if (conflictResult.rows.length > 0) {
        throw new ApiError(409, 'Doctor is not available at this time');
      }

      // Create appointment
      const insertQuery = `
        INSERT INTO appointments 
        (patient_id, doctor_id, appointment_datetime, status, type, notes, created_at, updated_at)
        VALUES ($1, $2, $3, 'scheduled', $4, $5, NOW(), NOW())
        RETURNING appointment_id, appointment_datetime, status
      `;

      const result = await dbClient.query(insertQuery, [
        patient_id,
        doctor_id,
        appointment_datetime,
        type,
        notes
      ]);

      logger.info(`Appointment created successfully with ID: ${result.rows[0].appointment_id}`);

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      logger.error('Failed to create appointment:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to create appointment'));
      }
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      logger.info(`Updating appointment status for ID: ${id} to: ${status}`);

      if (!['scheduled', 'completed', 'cancelled', 'no_show'].includes(status)) {
        throw new ApiError(400, 'Invalid status. Must be one of: scheduled, completed, cancelled, no_show');
      }

      const query = `
        UPDATE appointments 
        SET status = $1, updated_at = NOW()
        WHERE appointment_id = $2
        RETURNING appointment_id, status
      `;

      const result = await dbClient.query(query, [status, id]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Appointment not found');
      }

      res.json({
        success: true,
        message: 'Appointment status updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      logger.error('Failed to update appointment status:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to update appointment status'));
      }
    }
  }

  // Get departments and doctors for dropdowns
  async getDepartmentsAndDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting departments and doctors for appointment form');

      // Get departments
      const departmentsQuery = `
        SELECT department_id, name, description
        FROM departments
        WHERE is_active = true
        ORDER BY name
      `;

      const departmentsResult = await dbClient.query(departmentsQuery);

      // Get doctors with department info
      const doctorsQuery = `
        SELECT 
          d.doctor_id,
          u.user_id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          d.specialty,
          dept.department_id,
          dept.name as department_name,
          d.consultation_fee
        FROM doctors d
        JOIN users u ON d.doctor_id = u.user_id
        JOIN departments dept ON d.department_id = dept.department_id
        WHERE u.status = 'active'
        ORDER BY dept.name, u.first_name, u.last_name
      `;

      const doctorsResult = await dbClient.query(doctorsQuery);

      // Get patients for dropdown
      const patientsQuery = `
        SELECT 
          p.patient_id,
          u.user_id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          u.email,
          u.phone
        FROM patients p
        JOIN users u ON p.patient_id = u.user_id
        WHERE u.status = 'active'
        ORDER BY u.first_name, u.last_name
        LIMIT 100
      `;

      const patientsResult = await dbClient.query(patientsQuery);

      res.json({
        success: true,
        data: {
          departments: departmentsResult.rows,
          doctors: doctorsResult.rows,
          patients: patientsResult.rows
        }
      });

    } catch (error) {
      logger.error('Failed to get departments and doctors:', error);
      next(new ApiError(500, 'Failed to get departments and doctors'));
    }
  }

  // Get dynamic color assignments for calendar
  async getColorAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting color assignments for calendar');

      // Get departments
      const departmentsQuery = `
        SELECT 
          department_id,
          name
        FROM departments
        WHERE is_active = true
        ORDER BY name
      `;

      const departmentsResult = await dbClient.query(departmentsQuery);

      // Get doctors
      const doctorsQuery = `
        SELECT 
          d.doctor_id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          d.specialty,
          dept.department_id,
          dept.name as department_name
        FROM doctors d
        JOIN users u ON d.doctor_id = u.user_id
        JOIN departments dept ON d.department_id = dept.department_id
        WHERE u.status = 'active'
        ORDER BY dept.name, u.first_name
      `;

      const doctorsResult = await dbClient.query(doctorsQuery);

      // Generate default colors
      const defaultColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];

      let colorIndex = 0;

      // Assign colors to departments
      const departments = departmentsResult.rows.map(dept => {
        return {
          ...dept,
          color: defaultColors[colorIndex++ % defaultColors.length]
        };
      });

      // Assign colors to doctors based on their department color
      const doctors = doctorsResult.rows.map(doctor => {
        const deptColor = departments.find(d => d.department_id === doctor.department_id)?.color || defaultColors[0];
        return {
          ...doctor,
          color: deptColor
        };
      });

      res.json({
        success: true,
        data: {
          departments,
          doctors,
          statusColors: {
            scheduled: '#F59E0B',
            completed: '#10B981',
            cancelled: '#EF4444',
            no_show: '#6B7280'
          },
          specialTypes: {
            emergency: '#DC2626',
            long_appointment: '#7C3AED',
            same_patient_multiple: '#059669',
            scheduling_conflict: '#B91C1C'
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get color assignments:', error);
      next(new ApiError(500, 'Failed to get color assignments'));
    }
  }

  // Get filter options (status, types, etc.)
  async getFilterOptions(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting filter options for appointments');

      // Get distinct appointment types from the database
      const typesQuery = `
        SELECT DISTINCT type
        FROM appointments
        WHERE type IS NOT NULL AND type != ''
        ORDER BY type
      `;

      const typesResult = await dbClient.query(typesQuery);

      // Define available status options (based on enum)
      const statusOptions = [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no_show', label: 'No Show' }
      ];

      // Format appointment types
      const appointmentTypes = typesResult.rows.map(row => ({
        value: row.type,
        label: row.type.charAt(0).toUpperCase() + row.type.slice(1)
      }));

      res.json({
        success: true,
        data: {
          statusOptions,
          appointmentTypes
        }
      });

    } catch (error) {
      logger.error('Failed to get filter options:', error);
      next(new ApiError(500, 'Failed to get filter options'));
    }
  }
}

export default new AdminAppointmentsController(); 