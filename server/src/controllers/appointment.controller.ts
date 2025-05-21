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
 * 获取预约详情
 */
export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 根据用户角色确定查询逻辑
    let query = '';
    const params: any[] = [id];

    if (req.user?.role === 'patient') {
      // 患者只能查看自己的预约
      query = `
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
          d.department_id as "departmentId",
          dep.name as "departmentName",
          u.first_name as "doctorFirstName",
          u.last_name as "doctorLastName",
          u.email as "doctorEmail",
          u.phone as "doctorPhone"
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN departments dep ON d.department_id = dep.department_id
        JOIN users u ON d.doctor_id = u.user_id
        WHERE a.appointment_id = $1 AND a.patient_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      // 医生只能查看自己的预约
      query = `
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
          p.date_of_birth as "patientDateOfBirth",
          p.blood_group as "patientBloodGroup",
          p.height as "patientHeight",
          p.weight as "patientWeight",
          pu.first_name as "patientFirstName",
          pu.last_name as "patientLastName",
          pu.email as "patientEmail",
          pu.phone as "patientPhone"
        FROM appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        JOIN users pu ON p.patient_id = pu.user_id
        WHERE a.appointment_id = $1 AND a.doctor_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      // 管理员可以查看所有预约
      query = `
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
          d.department_id as "departmentId",
          dep.name as "departmentName",
          du.first_name as "doctorFirstName",
          du.last_name as "doctorLastName",
          du.email as "doctorEmail",
          du.phone as "doctorPhone",
          pu.first_name as "patientFirstName",
          pu.last_name as "patientLastName",
          pu.email as "patientEmail",
          pu.phone as "patientPhone"
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN departments dep ON d.department_id = dep.department_id
        JOIN users du ON d.doctor_id = du.user_id
        JOIN patients p ON a.patient_id = p.patient_id
        JOIN users pu ON p.patient_id = pu.user_id
        WHERE a.appointment_id = $1
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await dbClient.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 获取相关的医疗记录（如果有）
    const medicalRecordQuery = `
      SELECT 
        mr.record_id as id,
        mr.diagnosis,
        mr.prescription,
        mr.notes,
        mr.created_at as "createdAt"
      FROM medical_records mr
      WHERE mr.appointment_id = $1
    `;

    const medicalRecordResult = await dbClient.query(medicalRecordQuery, [id]);
    
    // 组合结果
    const appointment = result.rows[0];
    if (medicalRecordResult.rows.length > 0) {
      appointment.medicalRecord = medicalRecordResult.rows[0];
    }

    return res.status(200).json(appointment);
  } catch (error) {
    logger.error('Error in getAppointmentById:', error);
    return res.status(500).json({ message: 'Failed to retrieve appointment' });
  }
};

/**
 * 创建新的预约
 */
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      doctorId,
      appointmentDateTime,
      type,
      reason,
      symptoms,
      duration = 30 // 默认30分钟
    } = req.body;

    // 验证必要字段
    if (!doctorId || !appointmentDateTime || !type || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 计算结束时间
    const endDateTime = new Date(new Date(appointmentDateTime).getTime() + duration * 60000);

    // 检查医生在该时间段是否有其他预约
    const conflictQuery = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE doctor_id = $1
        AND status NOT IN ('cancelled', 'no_show')
        AND (
          (appointment_datetime <= $2 AND end_datetime > $2)
          OR
          (appointment_datetime < $3 AND end_datetime >= $3)
          OR
          (appointment_datetime >= $2 AND end_datetime <= $3)
        )
    `;

    const conflictResult = await dbClient.query(conflictQuery, [
      doctorId,
      appointmentDateTime,
      endDateTime.toISOString()
    ]);

    if (parseInt(conflictResult.rows[0].count) > 0) {
      return res.status(409).json({ message: 'Doctor already has an appointment at this time' });
    }

    // 插入新预约
    const insertQuery = `
      INSERT INTO appointments (
        patient_id,
        doctor_id,
        appointment_datetime,
        end_datetime,
        status,
        type,
        reason,
        symptoms,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
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
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const insertResult = await dbClient.query(insertQuery, [
      patientId,
      doctorId,
      appointmentDateTime,
      endDateTime.toISOString(),
      'scheduled', // 初始状态为已安排
      type,
      reason,
      symptoms || [],
    ]);

    const newAppointment = insertResult.rows[0];

    // 获取医生信息
    const doctorQuery = `
      SELECT 
        d.doctor_id as id,
        d.department_id as "departmentId",
        dep.name as "departmentName",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone
      FROM doctors d
      JOIN departments dep ON d.department_id = dep.department_id
      JOIN users u ON d.doctor_id = u.user_id
      WHERE d.doctor_id = $1
    `;

    const doctorResult = await dbClient.query(doctorQuery, [doctorId]);
    
    if (doctorResult.rows.length > 0) {
      newAppointment.doctor = {
        id: doctorResult.rows[0].id,
        userId: doctorResult.rows[0].id,
        department: {
          id: doctorResult.rows[0].departmentId,
          name: doctorResult.rows[0].departmentName
        },
        user: {
          firstName: doctorResult.rows[0].firstName,
          lastName: doctorResult.rows[0].lastName,
          email: doctorResult.rows[0].email,
          phone: doctorResult.rows[0].phone
        }
      };
    }

    return res.status(201).json(newAppointment);
  } catch (error) {
    logger.error('Error in createAppointment:', error);
    return res.status(500).json({ message: 'Failed to create appointment' });
  }
};

/**
 * 取消预约
 */
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    // 验证用户有权限取消此预约
    let query = '';
    const params: any[] = [id];

    if (req.user?.role === 'patient') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await dbClient.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission' });
    }

    // 检查预约是否已经取消
    if (result.rows[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    // 检查预约是否已完成
    if (result.rows[0].status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    // 更新预约状态
    const updateQuery = `
      UPDATE appointments
      SET 
        status = 'cancelled',
        cancellation_reason = $1,
        cancelled_by = $3,
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
        cancelled_by as "cancelledBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const updateResult = await dbClient.query(updateQuery, [reason, id, userId]);
    
    return res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    logger.error('Error in cancelAppointment:', error);
    return res.status(500).json({ message: 'Failed to cancel appointment' });
  }
};

/**
 * 重新安排预约
 */
export const rescheduleAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { appointmentDateTime } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!appointmentDateTime) {
      return res.status(400).json({ message: 'New appointment date and time is required' });
    }

    // 验证用户有权限重新安排此预约
    let query = '';
    const params: any[] = [id];

    if (req.user?.role === 'patient') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await dbClient.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission' });
    }

    // 获取原始预约信息
    const originalAppointment = result.rows[0];

    // 检查预约是否已取消
    if (originalAppointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule a cancelled appointment' });
    }

    // 检查预约是否已完成
    if (originalAppointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot reschedule a completed appointment' });
    }

    // 计算新的结束时间（保持原来的持续时间）
    const originalStartTime = new Date(originalAppointment.appointment_datetime).getTime();
    const originalEndTime = new Date(originalAppointment.end_datetime).getTime();
    const duration = (originalEndTime - originalStartTime) / 60000; // 分钟
    
    const newEndDateTime = new Date(new Date(appointmentDateTime).getTime() + duration * 60000);

    // 检查医生在新时间段是否有其他预约
    const conflictQuery = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_id != $2
        AND status NOT IN ('cancelled', 'no_show')
        AND (
          (appointment_datetime <= $3 AND end_datetime > $3)
          OR
          (appointment_datetime < $4 AND end_datetime >= $4)
          OR
          (appointment_datetime >= $3 AND end_datetime <= $4)
        )
    `;

    const conflictResult = await dbClient.query(conflictQuery, [
      originalAppointment.doctor_id,
      id,
      appointmentDateTime,
      newEndDateTime.toISOString()
    ]);

    if (parseInt(conflictResult.rows[0].count) > 0) {
      return res.status(409).json({ message: 'Doctor already has an appointment at this time' });
    }

    // 更新预约时间
    const updateQuery = `
      UPDATE appointments
      SET 
        appointment_datetime = $1,
        end_datetime = $2,
        status = 'scheduled',
        updated_at = NOW()
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

    const updateResult = await dbClient.query(updateQuery, [
      appointmentDateTime,
      newEndDateTime.toISOString(),
      id
    ]);
    
    return res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    logger.error('Error in rescheduleAppointment:', error);
    return res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
};

/**
 * 确认预约
 */
export const confirmAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 验证用户有权限确认此预约
    let query = '';
    const params: any[] = [id];

    if (req.user?.role === 'patient') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      query = `
        SELECT * FROM appointments WHERE appointment_id = $1
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await dbClient.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission' });
    }

    // 检查预约是否已取消
    if (result.rows[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot confirm a cancelled appointment' });
    }

    // 检查预约是否已完成
    if (result.rows[0].status === 'completed') {
      return res.status(400).json({ message: 'Appointment is already completed' });
    }

    // 更新预约状态
    const updateQuery = `
      UPDATE appointments
      SET 
        status = 'confirmed',
        updated_at = NOW()
      WHERE appointment_id = $1
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

    const updateResult = await dbClient.query(updateQuery, [id]);
    
    return res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    logger.error('Error in confirmAppointment:', error);
    return res.status(500).json({ message: 'Failed to confirm appointment' });
  }
};

/**
 * 获取医生可用时间段
 */
export const getDoctorAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }

    // 获取医生的工作时间
    const scheduleQuery = `
      SELECT 
        day_of_week,
        start_time,
        end_time,
        break_start,
        break_end
      FROM doctor_schedules
      WHERE doctor_id = $1 AND is_active = true
    `;

    const scheduleResult = await dbClient.query(scheduleQuery, [doctorId]);
    
    // 获取医生在该日期的已有预约
    const appointmentsQuery = `
      SELECT 
        appointment_datetime as "startTime",
        end_datetime as "endTime"
      FROM appointments
      WHERE 
        doctor_id = $1 
        AND DATE(appointment_datetime) = $2
        AND status NOT IN ('cancelled', 'no_show')
      ORDER BY appointment_datetime
    `;

    const queryDate = date as string;
    const appointmentsResult = await dbClient.query(appointmentsQuery, [doctorId, queryDate]);
    
    // 获取选择日期是星期几
    const selectedDate = new Date(queryDate);
    const dayOfWeek = selectedDate.getDay(); // 0是周日，1是周一，依此类推
    
    // 找到该日期对应的工作时间
    const daySchedule = scheduleResult.rows.find(
      schedule => parseInt(schedule.day_of_week) === dayOfWeek
    );
    
    if (!daySchedule) {
      return res.status(200).json({ availableSlots: [] });
    }
    
    // 解析工作时间
    const [startHour, startMinute] = daySchedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end_time.split(':').map(Number);
    
    // 生成时间段（假设每个时间段是30分钟）
    const slots = [];
    const slotDuration = 30; // 分钟
    
    let currentSlot = new Date(selectedDate);
    currentSlot.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    while (currentSlot < endTime) {
      const slotEndTime = new Date(currentSlot.getTime() + slotDuration * 60000);
      
      // 检查这个时间段是否与已有预约冲突
      const isConflicting = appointmentsResult.rows.some(appt => {
        const apptStart = new Date(appt.startTime);
        const apptEnd = new Date(appt.endTime);
        
        return (
          (currentSlot >= apptStart && currentSlot < apptEnd) ||
          (slotEndTime > apptStart && slotEndTime <= apptEnd) ||
          (currentSlot <= apptStart && slotEndTime >= apptEnd)
        );
      });
      
      // 如果没有冲突，添加到可用时间段
      if (!isConflicting) {
        slots.push({
          startTime: currentSlot.toISOString(),
          endTime: slotEndTime.toISOString()
        });
      }
      
      // 移动到下一个时间段
      currentSlot = slotEndTime;
    }
    
    return res.status(200).json({ availableSlots: slots });
  } catch (error) {
    logger.error('Error in getDoctorAvailableSlots:', error);
    return res.status(500).json({ message: 'Failed to retrieve available slots' });
  }
};

/**
 * 获取预约相关的医疗记录
 */
export const getAppointmentMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 验证用户有权限访问此预约的医疗记录
    let appointmentQuery = '';
    const params: any[] = [id];

    if (req.user?.role === 'patient') {
      appointmentQuery = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      appointmentQuery = `
        SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      appointmentQuery = `
        SELECT * FROM appointments WHERE appointment_id = $1
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const appointmentResult = await dbClient.query(appointmentQuery, params);

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or you do not have permission' });
    }

    // 获取医疗记录
    const medicalRecordQuery = `
      SELECT 
        mr.record_id as id,
        mr.diagnosis,
        mr.prescription,
        mr.notes,
        mr.created_at as "createdAt"
      FROM medical_records mr
      WHERE mr.appointment_id = $1
    `;

    const medicalRecordResult = await dbClient.query(medicalRecordQuery, [id]);

    if (medicalRecordResult.rows.length === 0) {
      return res.status(404).json({ message: 'No medical record found for this appointment' });
    }

    const medicalRecord = medicalRecordResult.rows[0];
    
    // 添加医生信息
    medicalRecord.doctor = {
      user: {
        firstName: medicalRecord.doctorFirstName,
        lastName: medicalRecord.doctorLastName
      }
    };
    
    // 删除不需要的字段
    delete medicalRecord.doctorFirstName;
    delete medicalRecord.doctorLastName;

    return res.status(200).json(medicalRecord);
  } catch (error) {
    logger.error('Error in getAppointmentMedicalRecord:', error);
    return res.status(500).json({ message: 'Failed to retrieve medical record' });
  }
};
