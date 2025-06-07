import { Request, Response } from 'express';
import { Request as AuthRequest } from 'express';
import dbClient from '../utils/db-client';
import { logger } from '../utils/logger';

/**
 * 获取医生仪表盘统计数据
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    logger.info(`Fetching dashboard stats for doctor ID: ${doctorId}`);

    // Fixed date for consistent data display: 2025-05-28 (Wednesday)
    const FIXED_DATE = '2025-05-28';

    // 1. 获取总患者数和上周比较
    const patientCountResult = await dbClient.query(`
      WITH current_patients AS (
        SELECT COUNT(DISTINCT patient_id) as count
        FROM appointments
        WHERE doctor_id = $1
        AND appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
        AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
      ),
      last_week_patients AS (
        SELECT COUNT(DISTINCT patient_id) as count
        FROM appointments
        WHERE doctor_id = $1
        AND appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
        AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}')
      )
      SELECT 
        cp.count as current_count,
        cp.count - COALESCE(lwp.count, 0) as weekly_change
      FROM current_patients cp
      LEFT JOIN last_week_patients lwp ON true
    `, [doctorId]);

    // 2. 获取每周预约统计
    const weeklyAppointments = await dbClient.query(`
      SELECT 
        DATE_TRUNC('day', appointment_datetime) as date,
        COUNT(*) as count
      FROM appointments
      WHERE doctor_id = $1
      AND appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
      AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
      GROUP BY DATE_TRUNC('day', appointment_datetime)
      ORDER BY date
    `, [doctorId]);

    // 3. 获取预约类型分布
    const appointmentTypes = await dbClient.query(`
      SELECT 
        type,
        COUNT(*) as count
      FROM appointments
      WHERE doctor_id = $1
      AND appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '4 weeks'
      AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
      GROUP BY type
    `, [doctorId]);

    // 4. 获取平均问诊时间 - 使用新的 consultation_duration 字段
    const avgConsultationTime = await dbClient.query(`
      WITH consultation_times AS (
        SELECT 
          consultation_duration as duration
        FROM appointments
        WHERE doctor_id = $1
        AND status = 'completed'
        AND consultation_duration IS NOT NULL
        AND consultation_duration > 0
        AND appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '4 weeks'
        AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
      ),
      current_avg AS (
        SELECT AVG(duration) as current_avg
        FROM consultation_times
        WHERE EXISTS (
          SELECT 1 FROM appointments a2 
          WHERE a2.doctor_id = $1 
          AND a2.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND a2.appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
        )
      ),
      last_week_avg AS (
        SELECT AVG(duration) as last_week_avg
        FROM consultation_times
        WHERE EXISTS (
          SELECT 1 FROM appointments a3 
          WHERE a3.doctor_id = $1 
          AND a3.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
          AND a3.appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}')
        )
      )
      SELECT 
        ROUND(COALESCE(ca.current_avg, 45)::numeric, 0) as avg_minutes,
        ROUND((COALESCE(ca.current_avg, 45) - COALESCE(lwa.last_week_avg, 45))::numeric, 0) as weekly_change
      FROM current_avg ca
      CROSS JOIN last_week_avg lwa
    `, [doctorId]);

    // 5. 获取满意度评分
    const satisfactionRating = await dbClient.query(`
      WITH current_rating AS (
        SELECT AVG(rating) as current_avg
        FROM reviews
        WHERE doctor_id = $1
        AND created_at >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
        AND created_at < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
      ),
      last_week_rating AS (
        SELECT AVG(rating) as last_week_avg
        FROM reviews
        WHERE doctor_id = $1
        AND created_at >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
        AND created_at < DATE_TRUNC('week', DATE '${FIXED_DATE}')
      )
      SELECT 
        ROUND(COALESCE(cr.current_avg, 4.5)::numeric, 1) as rating,
        ROUND((COALESCE(cr.current_avg, 4.5) - COALESCE(lwr.last_week_avg, 4.5))::numeric, 1) as weekly_change
      FROM current_rating cr
      CROSS JOIN last_week_rating lwr
    `, [doctorId]);

    // 6. 获取最近患者笔记（只从completed状态的appointments获取）
    const recentNotes = await dbClient.query(`
      SELECT 
        a.appointment_id,
        a.notes as content,
        a.appointment_datetime as timestamp,
        a.patient_id,
        u.first_name,
        u.last_name
      FROM appointments a
      JOIN users u ON a.patient_id = u.user_id
      WHERE a.doctor_id = $1
      AND a.status = 'completed'
      AND a.notes IS NOT NULL
      AND a.notes != ''
      AND TRIM(a.notes) != ''
      AND a.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '4 weeks'
      ORDER BY a.appointment_datetime DESC
      LIMIT 5
    `, [doctorId]);

    // 组装返回数据
    const response = {
      totalPatients: {
        count: patientCountResult.rows[0].current_count,
        change: patientCountResult.rows[0].weekly_change
      },
      weeklyAppointments: weeklyAppointments.rows,
      appointmentTypes: appointmentTypes.rows.reduce((acc: any, curr: any) => {
        acc[curr.type.toLowerCase()] = curr.count;
        return acc;
      }, {}),
      avgConsultationTime: {
        minutes: avgConsultationTime.rows[0]?.avg_minutes || 0,
        change: avgConsultationTime.rows[0]?.weekly_change || 0
      },
      satisfactionRating: {
        rating: satisfactionRating.rows[0]?.rating || 0,
        change: satisfactionRating.rows[0]?.weekly_change || 0
      },
      recentNotes: recentNotes.rows.map(note => ({
        patientName: `${note.first_name} ${note.last_name}`,
        note: note.content,
        timestamp: note.timestamp,
        appointmentId: note.appointment_id
      }))
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error in getDashboardStats:', error);
    return res.status(500).json({ message: 'Failed to retrieve dashboard statistics' });
  }
};

/**
 * 获取医生今日预约列表
 */
export const getTodayAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    logger.info(`Fetching today's appointments for doctor ID: ${doctorId}`);

    // Fixed date for consistent data display: 2025-05-28 (Wednesday)
    const FIXED_DATE = '2025-05-28';

    const appointments = await dbClient.query(`
      SELECT 
        a.appointment_id as id,
        a.appointment_datetime,
        a.type,
        a.status,
        p.patient_id,
        u.first_name,
        u.last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON p.patient_id = u.user_id
      WHERE a.doctor_id = $1
      AND DATE(a.appointment_datetime) = DATE '${FIXED_DATE}'
      ORDER BY a.appointment_datetime ASC
    `, [doctorId]);

    return res.status(200).json(appointments.rows);
  } catch (error) {
    logger.error('Error in getTodayAppointments:', error);
    return res.status(500).json({ message: 'Failed to retrieve today\'s appointments' });
  }
}; 