import { Request, Response } from 'express';
import dbClient from '../utils/db-client';
import { logger } from '../utils/logger';

// 扩展Request类型，包含用户信息
interface AuthRequest extends Request {
  user?: {
    id: number;
    userId?: number;
    email: string;
    role: string;
  }
}

/**
 * 获取医生的所有预约
 */
export const getDoctorAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const status = req.query.status as string || 'all';
    const type = req.query.type as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    
    const params: any[] = [doctorId];
    let query = `
      SELECT 
        a.appointment_id as id,
        a.patient_id as "patientId",
        a.doctor_id as "doctorId",
        a.appointment_datetime as "appointmentDateTime",
        a.end_datetime as "endDateTime",
        a.status,
        a.type,
        a.reason,
        a.symptoms,
        a.notes,
        a.cancellation_reason as "cancellationReason",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        p.patient_id as "patientUserId",
        u.first_name as "patientFirstName",
        u.last_name as "patientLastName",
        u.email as "patientEmail",
        u.phone as "patientPhone"
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON p.patient_id = u.user_id
      WHERE a.doctor_id = $1
    `;
    
    // 根据status参数筛选
    if (status === 'scheduled') {
      query += ` AND a.status = 'scheduled'`;
    } else if (status === 'completed') {
      query += ` AND a.status = 'completed'`;
    } else if (status === 'cancelled') {
      query += ` AND a.status = 'cancelled'`;
    } else if (status === 'no-show') {
      query += ` AND a.status = 'no_show'`;
    }
    
    // 根据type参数筛选
    if (type) {
      params.push(type);
      query += ` AND a.type = $${params.length}`;
    }
    
    // 根据日期范围筛选
    if (startDate) {
      params.push(startDate);
      query += ` AND a.appointment_datetime >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      query += ` AND a.appointment_datetime <= $${params.length}`;
    }
    
    // 根据患者姓名或ID搜索
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        u.first_name ILIKE $${params.length} OR 
        u.last_name ILIKE $${params.length} OR 
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${params.length} OR
        CAST(a.patient_id AS TEXT) LIKE $${params.length}
      )`;
    }
    
    query += `
      ORDER BY a.appointment_datetime DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const result = await dbClient.query(query, params);
    
    // 格式化返回数据
    const appointments = result.rows.map((row: any) => ({
      id: row.id,
      patientId: `P${row.patientId}`, // 格式化患者ID，添加P前缀
      doctorId: row.doctorId,
      appointmentDateTime: row.appointmentDateTime,
      endDateTime: row.endDateTime,
      status: row.status,
      type: row.type,
      reason: row.reason,
      symptoms: row.symptoms || [],
      notes: row.notes,
      cancellationReason: row.cancellationReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      patient: {
        id: row.patientId,
        userId: row.patientUserId,
        user: {
          firstName: row.patientFirstName,
          lastName: row.patientLastName,
          email: row.patientEmail,
          phone: row.patientPhone
        }
      }
    }));
    
    return res.status(200).json(appointments);
  } catch (error) {
    logger.error('Error in getDoctorAppointments:', error);
    return res.status(500).json({ message: 'Failed to retrieve appointments' });
  }
};

/**
 * 获取单个预约详情
 */
export const getDoctorAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const appointmentId = Number(req.params.id);
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    
    const query = `
      SELECT 
        a.appointment_id as id,
        a.patient_id as "patientId",
        a.doctor_id as "doctorId",
        a.appointment_datetime as "appointmentDateTime",
        a.end_datetime as "endDateTime",
        a.status,
        a.type,
        a.reason,
        a.symptoms,
        a.notes,
        a.cancellation_reason as "cancellationReason",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        p.patient_id as "patientUserId",
        p.date_of_birth as "dateOfBirth",
        p.blood_group as "bloodGroup",
        p.height,
        p.weight,
        u.first_name as "patientFirstName",
        u.last_name as "patientLastName",
        u.email as "patientEmail",
        u.phone as "patientPhone",
        mr.medical_record_id as "hasReport"
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON p.patient_id = u.user_id
      LEFT JOIN medical_records mr ON a.appointment_id = mr.appointment_id
      WHERE a.doctor_id = $1 AND a.appointment_id = $2
    `;
    
    const result = await dbClient.query(query, [doctorId, appointmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const row = result.rows[0];
    const appointment = {
      id: row.id,
      patientId: `P${row.patientId}`, // 格式化患者ID，添加P前缀
      doctorId: row.doctorId,
      appointmentDateTime: row.appointmentDateTime,
      endDateTime: row.endDateTime,
      status: row.status,
      type: row.type,
      reason: row.reason,
      symptoms: row.symptoms || [],
      notes: row.notes,
      cancellationReason: row.cancellationReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasReport: !!row.hasReport,
      patient: {
        id: row.patientId,
        userId: row.patientUserId,
        dateOfBirth: row.dateOfBirth,
        bloodGroup: row.bloodGroup,
        height: row.height,
        weight: row.weight,
        user: {
          firstName: row.patientFirstName,
          lastName: row.patientLastName,
          email: row.patientEmail,
          phone: row.patientPhone
        }
      }
    };
    
    return res.status(200).json(appointment);
  } catch (error) {
    logger.error('Error in getDoctorAppointmentById:', error);
    return res.status(500).json({ message: 'Failed to retrieve appointment details' });
  }
};

/**
 * 更新预约状态
 */
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const appointmentId = Number(req.params.id);
    const { status, notes } = req.body;
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    
    if (!['scheduled', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // 确认预约属于当前医生
    const checkQuery = `
      SELECT 1 FROM appointments 
      WHERE appointment_id = $1 AND doctor_id = $2
    `;
    const checkResult = await dbClient.query(checkQuery, [appointmentId, doctorId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // 更新预约状态
    const updateQuery = `
      UPDATE appointments
      SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
      WHERE appointment_id = $3
      RETURNING 
        appointment_id as id,
        patient_id as "patientId",
        doctor_id as "doctorId",
        appointment_datetime as "appointmentDateTime",
        end_datetime as "endDateTime",
        status,
        type,
        reason,
        symptoms,
        notes,
        cancellation_reason as "cancellationReason",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const updateResult = await dbClient.query(updateQuery, [status, notes, appointmentId]);
    const updatedAppointment = updateResult.rows[0];
    
    // 格式化患者ID
    updatedAppointment.patientId = `P${updatedAppointment.patientId}`;
    
    return res.status(200).json(updatedAppointment);
  } catch (error) {
    logger.error('Error in updateAppointmentStatus:', error);
    return res.status(500).json({ message: 'Failed to update appointment status' });
  }
};

/**
 * 更新预约备注
 */
export const updateAppointmentNotes = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const appointmentId = Number(req.params.id);
    const { notes } = req.body;
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    
    if (typeof notes !== 'string') {
      return res.status(400).json({ message: 'Notes must be a string' });
    }
    
    // 确认预约属于当前医生
    const checkQuery = `
      SELECT 1 FROM appointments 
      WHERE appointment_id = $1 AND doctor_id = $2
    `;
    const checkResult = await dbClient.query(checkQuery, [appointmentId, doctorId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // 更新预约备注
    const updateQuery = `
      UPDATE appointments
      SET notes = $1, updated_at = NOW()
      WHERE appointment_id = $2
      RETURNING 
        appointment_id as id,
        patient_id as "patientId",
        doctor_id as "doctorId",
        appointment_datetime as "appointmentDateTime",
        end_datetime as "endDateTime",
        status,
        type,
        reason,
        symptoms,
        notes,
        cancellation_reason as "cancellationReason",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const updateResult = await dbClient.query(updateQuery, [notes, appointmentId]);
    const updatedAppointment = updateResult.rows[0];
    
    // 格式化患者ID
    updatedAppointment.patientId = `P${updatedAppointment.patientId}`;
    
    return res.status(200).json(updatedAppointment);
  } catch (error) {
    logger.error('Error in updateAppointmentNotes:', error);
    return res.status(500).json({ message: 'Failed to update appointment notes' });
  }
};

/**
 * 获取医生今日预约列表
 */
export const getTodayAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    logger.info(`[getTodayAppointments] Fetching appointments for doctor ID: ${doctorId}`);
    logger.info(`[getTodayAppointments] User info:`, {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    });

    const query = `
      SELECT 
        a.appointment_id as id,
        a.appointment_datetime as "appointmentDateTime",
        a.type,
        a.status,
        a.patient_id as "patientId",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email as "email"
      FROM appointments a
      JOIN users u ON a.patient_id = u.user_id
      WHERE a.doctor_id = $1
      AND DATE(a.appointment_datetime) = CURRENT_DATE
      ORDER BY a.appointment_datetime ASC
    `;

    logger.info(`[getTodayAppointments] Executing query with doctorId: ${doctorId}`);
    const result = await dbClient.query(query, [doctorId]);
    logger.info(`[getTodayAppointments] Found ${result.rows.length} appointments`);
    logger.debug(`[getTodayAppointments] Appointments data:`, result.rows);

    return res.status(200).json(result.rows);
  } catch (error) {
    logger.error('[getTodayAppointments] Error:', error);
    logger.error('[getTodayAppointments] Request details:', {
      headers: req.headers,
      user: req.user,
      params: req.params,
      query: req.query
    });
    return res.status(500).json({ message: 'Failed to retrieve today\'s appointments' });
  }
};

/**
 * 标记预约为已完成
 */
export const markAppointmentAsCompleted = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const appointmentId = Number(req.params.id);
    const { notes } = req.body;
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    
    // 确认预约属于当前医生
    const checkQuery = `
      SELECT 1 FROM appointments 
      WHERE appointment_id = $1 AND doctor_id = $2
    `;
    const checkResult = await dbClient.query(checkQuery, [appointmentId, doctorId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // 更新预约状态为已完成
    const updateQuery = `
      UPDATE appointments
      SET 
        status = 'completed',
        notes = COALESCE($1, notes),
        end_datetime = NOW(),
        updated_at = NOW()
      WHERE appointment_id = $2
      RETURNING 
        appointment_id as id,
        patient_id as "patientId",
        doctor_id as "doctorId",
        appointment_datetime as "appointmentDateTime",
        end_datetime as "endDateTime",
        status,
        type,
        reason,
        symptoms,
        notes,
        cancellation_reason as "cancellationReason",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const updateResult = await dbClient.query(updateQuery, [notes, appointmentId]);
    const updatedAppointment = updateResult.rows[0];
    
    // 格式化患者ID
    updatedAppointment.patientId = `P${updatedAppointment.patientId}`;
    
    return res.status(200).json(updatedAppointment);
  } catch (error) {
    logger.error('Error in markAppointmentAsCompleted:', error);
    return res.status(500).json({ message: 'Failed to mark appointment as completed' });
  }
};

/**
 * 标记预约为未出席
 */
export const markAppointmentAsNoShow = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const appointmentId = Number(req.params.id);
    const { notes } = req.body;
    
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    
    // 确认预约属于当前医生
    const checkQuery = `
      SELECT 1 FROM appointments 
      WHERE appointment_id = $1 AND doctor_id = $2
    `;
    const checkResult = await dbClient.query(checkQuery, [appointmentId, doctorId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // 更新预约状态为未出席
    const updateQuery = `
      UPDATE appointments
      SET 
        status = 'no_show',
        notes = COALESCE($1, notes),
        end_datetime = NOW(),
        updated_at = NOW()
      WHERE appointment_id = $2
      RETURNING 
        appointment_id as id,
        patient_id as "patientId",
        doctor_id as "doctorId",
        appointment_datetime as "appointmentDateTime",
        end_datetime as "endDateTime",
        status,
        type,
        reason,
        symptoms,
        notes,
        cancellation_reason as "cancellationReason",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const updateResult = await dbClient.query(updateQuery, [notes, appointmentId]);
    const updatedAppointment = updateResult.rows[0];
    
    // 格式化患者ID
    updatedAppointment.patientId = `P${updatedAppointment.patientId}`;
    
    return res.status(200).json(updatedAppointment);
  } catch (error) {
    logger.error('Error in markAppointmentAsNoShow:', error);
    return res.status(500).json({ message: 'Failed to mark appointment as no-show' });
  }
}; 