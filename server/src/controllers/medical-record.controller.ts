import { Request, Response } from 'express';
import dbClient from '../utils/db-client';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: number;
    userId?: number;
    email: string;
    role: string;
  }
}

/**
 * 获取单个医疗记录
 */
export const getMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 验证用户有权限访问此医疗记录
    let recordQuery = '';
    const params: any[] = [id];

    if (req.user?.role === 'patient') {
      recordQuery = `
        SELECT * FROM medical_records WHERE record_id = $1 AND patient_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      recordQuery = `
        SELECT * FROM medical_records WHERE record_id = $1 AND doctor_id = $2
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      recordQuery = `
        SELECT * FROM medical_records WHERE record_id = $1
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const recordResult = await dbClient.query(recordQuery, params);

    if (recordResult.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found or you do not have permission' });
    }

    // 获取详细医疗记录
    const detailQuery = `
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
        d.first_name as "doctorFirstName",
        d.last_name as "doctorLastName",
        p.first_name as "patientFirstName",
        p.last_name as "patientLastName"
      FROM medical_records mr
      JOIN users d ON mr.doctor_id = d.user_id
      JOIN users p ON mr.patient_id = p.user_id
      WHERE mr.record_id = $1
    `;

    const detailResult = await dbClient.query(detailQuery, [id]);
    const medicalRecord = detailResult.rows[0];
    
    // 添加医生和患者信息
    medicalRecord.doctor = {
      user: {
        firstName: medicalRecord.doctorFirstName,
        lastName: medicalRecord.doctorLastName
      }
    };
    
    medicalRecord.patient = {
      user: {
        firstName: medicalRecord.patientFirstName,
        lastName: medicalRecord.patientLastName
      }
    };
    
    // 删除不需要的字段
    delete medicalRecord.doctorFirstName;
    delete medicalRecord.doctorLastName;
    delete medicalRecord.patientFirstName;
    delete medicalRecord.patientLastName;

    return res.status(200).json(medicalRecord);
  } catch (error) {
    logger.error('Error in getMedicalRecord:', error);
    return res.status(500).json({ message: 'Failed to retrieve medical record' });
  }
};

/**
 * 获取患者所有医疗记录
 */
export const getPatientMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 根据角色确定查询
    let query = '';
    const params: any[] = [];

    if (req.user?.role === 'patient') {
      // 患者只能查看自己的医疗记录
      query = `
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
          d.first_name as "doctorFirstName",
          d.last_name as "doctorLastName"
        FROM medical_records mr
        JOIN users d ON mr.doctor_id = d.user_id
        WHERE mr.patient_id = $1
        ORDER BY mr.created_at DESC
      `;
      params.push(userId);
    } else if (req.user?.role === 'doctor') {
      // 医生可以查看自己创建的医疗记录
      query = `
        SELECT 
          mr.record_id as id,
          mr.patient_id as "patientId",
          mr.doctor_id as "doctorId",
          mr.appointment_id as "appointmentId",
          mr.diagnosis,
          mr.prescription,
          mr.notes,
          mr.attachments,
          mr.created_at as "createdAt",
          mr.updated_at as "updatedAt",
          p.first_name as "patientFirstName",
          p.last_name as "patientLastName"
        FROM medical_records mr
        JOIN users p ON mr.patient_id = p.user_id
        WHERE mr.doctor_id = $1
        ORDER BY mr.created_at DESC
      `;
      params.push(userId);
    } else if (req.user?.role === 'admin') {
      // 管理员可以查看所有记录
      const { patientId } = req.query;
      
      if (patientId) {
        query = `
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
            d.first_name as "doctorFirstName",
            d.last_name as "doctorLastName"
          FROM medical_records mr
          JOIN users d ON mr.doctor_id = d.user_id
          WHERE mr.patient_id = $1
          ORDER BY mr.created_at DESC
        `;
        params.push(patientId);
      } else {
        query = `
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
            d.first_name as "doctorFirstName",
            d.last_name as "doctorLastName",
            p.first_name as "patientFirstName",
            p.last_name as "patientLastName"
          FROM medical_records mr
          JOIN users d ON mr.doctor_id = d.user_id
          JOIN users p ON mr.patient_id = p.user_id
          ORDER BY mr.created_at DESC
          LIMIT 100
        `;
      }
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await dbClient.query(query, params);
    
    // 处理返回结果，添加医生/患者信息
    const processedRecords = result.rows.map(record => {
      const processed = { ...record };
      
      if (record.doctorFirstName) {
        processed.doctor = {
          user: {
            firstName: record.doctorFirstName,
            lastName: record.doctorLastName
          }
        };
        
        delete processed.doctorFirstName;
        delete processed.doctorLastName;
      }
      
      if (record.patientFirstName) {
        processed.patient = {
          user: {
            firstName: record.patientFirstName,
            lastName: record.patientLastName
          }
        };
        
        delete processed.patientFirstName;
        delete processed.patientLastName;
      }
      
      return processed;
    });

    return res.status(200).json(processedRecords);
  } catch (error) {
    logger.error('Error in getPatientMedicalRecords:', error);
    return res.status(500).json({ message: 'Failed to retrieve medical records' });
  }
};

/**
 * 创建医疗记录
 */
export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId || req.user?.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create medical records' });
    }
    
    const { 
      patientId, 
      appointmentId, 
      diagnosis, 
      prescription, 
      notes, 
      recordType,
      followUpDate,
      attachments
    } = req.body;
    
    if (!patientId || !diagnosis) {
      return res.status(400).json({ message: 'Patient ID and diagnosis are required' });
    }

    // 验证预约是否存在且属于该医生和患者
    if (appointmentId) {
      const appointmentQuery = `
        SELECT * FROM appointments 
        WHERE appointment_id = $1 AND doctor_id = $2 AND patient_id = $3
      `;
      
      const appointmentResult = await dbClient.query(appointmentQuery, [appointmentId, userId, patientId]);
      
      if (appointmentResult.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Appointment not found or does not belong to this doctor and patient' 
        });
      }
    }
    
    // 创建医疗记录
    const insertQuery = `
      INSERT INTO medical_records (
        patient_id, 
        doctor_id, 
        appointment_id, 
        diagnosis, 
        prescription, 
        notes, 
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING 
        record_id as id,
        patient_id as "patientId",
        doctor_id as "doctorId",
        appointment_id as "appointmentId",
        diagnosis,
        prescription,
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const prescriptionJSON = prescription ? JSON.stringify(prescription) : null;
    const attachmentsJSON = attachments ? JSON.stringify(attachments) : null;
    
    const result = await dbClient.query(insertQuery, [
      patientId,
      userId,
      appointmentId || null,
      diagnosis,
      prescriptionJSON,
      notes || null,
      attachmentsJSON
    ]);
    
    // 如果有预约ID，更新预约状态为已完成
    if (appointmentId) {
      const appointmentUpdateQuery = `
        UPDATE appointments
        SET status = 'completed', updated_at = NOW()
        WHERE appointment_id = $1
        RETURNING appointment_id
      `;
      
      await dbClient.query(appointmentUpdateQuery, [appointmentId]);
    }
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error in createMedicalRecord:', error);
    return res.status(500).json({ message: 'Failed to create medical record' });
  }
};

/**
 * 更新医疗记录
 */
export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // 验证医疗记录是否存在且属于该医生
    const checkQuery = `
      SELECT * FROM medical_records WHERE record_id = $1
    `;
    
    const checkResult = await dbClient.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    const record = checkResult.rows[0];
    
    // 只有创建记录的医生或管理员可以更新记录
    if (req.user?.role !== 'admin' && record.doctor_id !== userId) {
      return res.status(403).json({ message: 'You can only update your own medical records' });
    }
    
    const { 
      diagnosis, 
      prescription, 
      notes, 
      recordType,
      followUpDate,
      attachments
    } = req.body;
    
    // 构建更新查询
    let updateQuery = `
      UPDATE medical_records
      SET updated_at = NOW()
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (diagnosis !== undefined) {
      updateQuery += `, diagnosis = $${paramCounter++}`;
      params.push(diagnosis);
    }
    
    if (prescription !== undefined) {
      updateQuery += `, prescription = $${paramCounter++}`;
      params.push(JSON.stringify(prescription));
    }
    
    if (notes !== undefined) {
      updateQuery += `, notes = $${paramCounter++}`;
      params.push(notes);
    }
    
    if (recordType !== undefined) {
      updateQuery += `, record_type = $${paramCounter++}`;
      params.push(recordType);
    }
    
    if (followUpDate !== undefined) {
      updateQuery += `, follow_up_date = $${paramCounter++}`;
      params.push(followUpDate);
    }
    
    if (attachments !== undefined) {
      updateQuery += `, attachments = $${paramCounter++}`;
      params.push(JSON.stringify(attachments));
    }
    
    updateQuery += `
      WHERE record_id = $${paramCounter}
      RETURNING 
        record_id as id,
        patient_id as "patientId",
        doctor_id as "doctorId",
        appointment_id as "appointmentId",
        diagnosis,
        prescription,
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    params.push(id);
    
    // 如果没有要更新的字段
    if (params.length === 1) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    const result = await dbClient.query(updateQuery, params);
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Error in updateMedicalRecord:', error);
    return res.status(500).json({ message: 'Failed to update medical record' });
  }
};

/**
 * 删除医疗记录
 */
export const deleteMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // 验证医疗记录是否存在
    const checkQuery = `
      SELECT * FROM medical_records WHERE record_id = $1
    `;
    
    const checkResult = await dbClient.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    const record = checkResult.rows[0];
    
    // 只有管理员可以删除记录
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete medical records' });
    }
    
    // 删除医疗记录
    const deleteQuery = `
      DELETE FROM medical_records
      WHERE record_id = $1
    `;
    
    await dbClient.query(deleteQuery, [id]);
    
    return res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteMedicalRecord:', error);
    return res.status(500).json({ message: 'Failed to delete medical record' });
  }
}; 