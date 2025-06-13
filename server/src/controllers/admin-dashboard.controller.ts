import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { logger } from '../utils/logger';

// Dashboard interfaces
interface DashboardStats {
  totalAppointments: {
    count: number;
    change: number;
  };
  activePatients: {
    count: number;
    change: number;
  };
  activeDoctors: {
    count: number;
    change: number;
  };
  avgSatisfaction: {
    rating: number;
    change: number;
  };
  departmentPerformance: Array<{
    department_name: string;
    appointment_count: number;
  }>;
  appointmentTrends: Array<{
    day: string;
    count: number;
  }>;
}

interface AdminNotification {
  notification_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export class AdminDashboardController {

  // Get dashboard statistics
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting admin dashboard statistics');

      // Fixed date for consistent data display: 2025-05-28 (Wednesday)
      const FIXED_DATE = '2025-05-28';

      // 1. Total Appointments (current week vs last week)
      const appointmentsQuery = `
        WITH current_week AS (
          SELECT COUNT(*) as count
          FROM appointments
          WHERE appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
        ),
        last_week AS (
          SELECT COUNT(*) as count
          FROM appointments
          WHERE appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
          AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}')
        )
        SELECT 
          cm.count as current_count,
          CASE 
            WHEN lm.count = 0 THEN 0
            ELSE ROUND(((cm.count - lm.count) * 100.0 / lm.count), 1)
          END as change_percent
        FROM current_week cm
        CROSS JOIN last_week lm
      `;

      // 2. Active Patients (patients with appointments in current week vs last week)
      const activePatientsQuery = `
        WITH current_week_active AS (
          SELECT COUNT(DISTINCT patient_id) as count
          FROM appointments
          WHERE appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
        ),
        last_week_active AS (
          SELECT COUNT(DISTINCT patient_id) as count
          FROM appointments
          WHERE appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
          AND appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}')
        )
        SELECT 
          ca.count as current_count,
          CASE 
            WHEN lwa.count = 0 THEN 0
            ELSE ROUND(((ca.count - lwa.count) * 100.0 / lwa.count), 1)
          END as change_percent
        FROM current_week_active ca
        CROSS JOIN last_week_active lwa
      `;

      // 3. Active Doctors (doctors with appointments in current week vs last week)
      const activeDoctorsQuery = `
        WITH current_week_active AS (
          SELECT COUNT(DISTINCT a.doctor_id) as count
          FROM appointments a
          JOIN users u ON a.doctor_id = u.user_id
          WHERE a.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND a.appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
          AND u.status = 'active'
        ),
        last_week_active AS (
          SELECT COUNT(DISTINCT a.doctor_id) as count
          FROM appointments a
          JOIN users u ON a.doctor_id = u.user_id
          WHERE a.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
          AND a.appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND u.status = 'active'
        )
        SELECT 
          ca.count as current_count,
          CASE 
            WHEN lwa.count = 0 THEN 0
            ELSE ROUND(((ca.count - lwa.count) * 100.0 / lwa.count), 1)
          END as change_percent
        FROM current_week_active ca
        CROSS JOIN last_week_active lwa
      `;

      // 4. Average Satisfaction (from reviews in current week vs last week)
      const satisfactionQuery = `
        WITH current_week_rating AS (
          SELECT ROUND(AVG(rating), 1) as rating
          FROM reviews
          WHERE created_at >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND created_at < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
          AND status = 'approved'
        ),
        last_week_rating AS (
          SELECT ROUND(AVG(rating), 1) as rating
          FROM reviews
          WHERE created_at >= DATE_TRUNC('week', DATE '${FIXED_DATE}') - INTERVAL '1 week'
          AND created_at < DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND status = 'approved'
        )
        SELECT 
          COALESCE(cr.rating, 0) as current_rating,
          ROUND((COALESCE(cr.rating, 0) - COALESCE(lwr.rating, 0)), 1) as change
        FROM current_week_rating cr
        CROSS JOIN last_week_rating lwr
      `;

      // 5. Department Performance (appointments per department in current week)
      const departmentPerformanceQuery = `
        SELECT 
          d.name as department_name,
          COUNT(a.appointment_id) as appointment_count
        FROM departments d
        LEFT JOIN doctors doc ON d.department_id = doc.department_id
        LEFT JOIN appointments a ON doc.doctor_id = a.doctor_id
        AND a.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
        AND a.appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
        WHERE d.is_active = true
        AND d.name != 'Unassigned'
        GROUP BY d.department_id, d.name
        ORDER BY appointment_count DESC
      `;

      // 6. Appointment Trends (current week - 7 days with proper day names)
      const appointmentTrendsQuery = `
        WITH week_days AS (
          SELECT 
            generate_series(
              DATE_TRUNC('week', DATE '${FIXED_DATE}'),
              DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '6 days',
              INTERVAL '1 day'
            )::date as day_date
        ),
        daily_counts AS (
          SELECT 
            DATE(a.appointment_datetime) as appointment_date,
            COUNT(*) as count
          FROM appointments a
          WHERE a.appointment_datetime >= DATE_TRUNC('week', DATE '${FIXED_DATE}')
          AND a.appointment_datetime < DATE_TRUNC('week', DATE '${FIXED_DATE}') + INTERVAL '1 week'
          GROUP BY DATE(a.appointment_datetime)
        )
        SELECT 
          TO_CHAR(wd.day_date, 'Dy') as day,
          COALESCE(dc.count, 0) as count
        FROM week_days wd
        LEFT JOIN daily_counts dc ON wd.day_date = dc.appointment_date
        ORDER BY wd.day_date
      `;

      // Execute all queries
      const [
        appointmentsResult,
        activePatientsResult,
        activeDoctorsResult,
        satisfactionResult,
        departmentPerformanceResult,
        appointmentTrendsResult
      ] = await Promise.all([
        dbClient.query(appointmentsQuery),
        dbClient.query(activePatientsQuery),
        dbClient.query(activeDoctorsQuery),
        dbClient.query(satisfactionQuery),
        dbClient.query(departmentPerformanceQuery),
        dbClient.query(appointmentTrendsQuery)
      ]);

      const stats: DashboardStats = {
        totalAppointments: {
          count: parseInt(appointmentsResult.rows[0]?.current_count) || 0,
          change: parseFloat(appointmentsResult.rows[0]?.change_percent) || 0
        },
        activePatients: {
          count: parseInt(activePatientsResult.rows[0]?.current_count) || 0,
          change: parseFloat(activePatientsResult.rows[0]?.change_percent) || 0
        },
        activeDoctors: {
          count: parseInt(activeDoctorsResult.rows[0]?.current_count) || 0,
          change: parseFloat(activeDoctorsResult.rows[0]?.change_percent) || 0
        },
        avgSatisfaction: {
          rating: parseFloat(satisfactionResult.rows[0]?.current_rating) || 0,
          change: parseFloat(satisfactionResult.rows[0]?.change) || 0
        },
        departmentPerformance: departmentPerformanceResult.rows,
        appointmentTrends: appointmentTrendsResult.rows
      };

      logger.info('Admin dashboard stats retrieved successfully');

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Failed to get admin dashboard stats:', error);
      next(new ApiError(500, 'Failed to get dashboard statistics'));
    }
  }

  // Get admin notifications
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, unread_only = false } = req.query;
      
      logger.info('Getting admin notifications', { page, limit, unread_only });

      let whereClause = `WHERE n.type IN ('appointment', 'system', 'reminder')`;
      if (unread_only === 'true') {
        whereClause += ` AND n.is_read = false`;
      }

      const query = `
        SELECT 
          n.notification_id,
          n.title,
          n.message,
          n.type,
          n.is_read,
          n.created_at,
          n.data,
          u.user_id,
          u.email,
          u.first_name,
          u.last_name
        FROM notifications n
        JOIN users u ON n.user_id = u.user_id
        ${whereClause}
        ORDER BY n.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const offset = (Number(page) - 1) * Number(limit);
      const result = await dbClient.query(query, [Number(limit), offset]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM notifications n
        ${whereClause}
      `;
      const countResult = await dbClient.query(countQuery);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
        }
      });

    } catch (error) {
      logger.error('Failed to get admin notifications:', error);
      next(new ApiError(500, 'Failed to get notifications'));
    }
  }

  // Send notification
  async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, message, target_users = 'patients', specific_user_ids } = req.body;

      logger.info('Sending admin notification', { title, target_users, specific_user_ids });

      if (!title || !message) {
        throw new ApiError(400, 'Title and message are required');
      }

      let users = [];
      if (target_users === 'patients') {
        // 查所有 active 患者
        const patientsQuery = `SELECT u.user_id, u.email, u.first_name, u.last_name FROM users u JOIN patients p ON u.user_id = p.patient_id WHERE u.status = 'active' AND u.email IS NOT NULL`;
        const patientsResult = await dbClient.query(patientsQuery);
        users = patientsResult.rows;
      } else if (target_users === 'specific' && Array.isArray(specific_user_ids) && specific_user_ids.length > 0) {
        // 查指定患者
        const patientsQuery = `SELECT u.user_id, u.email, u.first_name, u.last_name FROM users u JOIN patients p ON u.user_id = p.patient_id WHERE u.user_id = ANY($1) AND u.status = 'active' AND u.email IS NOT NULL`;
        const patientsResult = await dbClient.query(patientsQuery, [specific_user_ids]);
        users = patientsResult.rows;
      } else {
        return res.status(400).json({ error: 'Invalid target_users or specific_user_ids' });
      }

      // 插入 notifications 记录
      const insertQuery = `
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING notification_id
      `;
      const notificationPromises = users.map(user => 
        dbClient.query(insertQuery, [user.user_id, title, message, 'system'])
      );
      await Promise.all(notificationPromises);

      // 返回邮件数据，字段与 EmailJS 模板变量完全一致
      const emailData = users.map(user => ({
        to_email: user.email,
        to_name: `${user.first_name} ${user.last_name}`,
        notification_title: title,
        notification_message: message,
        notification_type: 'system',
        notification_date: new Date().toLocaleDateString()
      }));

      logger.info(`Notification sent to ${users.length} patients, all eligible for email`);

      res.status(201).json({
        success: true,
        message: `Notification sent to ${users.length} patients`,
        data: {
          recipients: users.length,
          email_recipients: users.length,
          email_data: emailData
        }
      });
    } catch (error) {
      logger.error('Failed to send notification:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to send notification'));
      }
    }
  }

  // Mark notification as read
  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      logger.info(`Marking notification ${id} as read`);

      const query = `
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE notification_id = $1
        RETURNING notification_id, is_read
      `;

      const result = await dbClient.query(query, [id]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Notification not found');
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: result.rows[0]
      });

    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to mark notification as read'));
      }
    }
  }

  // Generate report
  async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        report_type = 'appointments', 
        date_from, 
        date_to, 
        department_id,
        format = 'json'
      } = req.body;

      logger.info('Generating admin report', { report_type, date_from, date_to });

      let reportData: any = {};

      switch (report_type) {
        case 'appointments':
          reportData = await this.generateAppointmentReport(date_from, date_to, department_id);
          break;
        case 'patients':
          reportData = await this.generatePatientReport(date_from, date_to);
          break;
        case 'doctors':
          reportData = await this.generateDoctorReport(date_from, date_to, department_id);
          break;
        default:
          throw new ApiError(400, 'Invalid report type');
      }

      res.json({
        success: true,
        data: {
          report_type,
          generated_at: new Date().toISOString(),
          date_range: { from: date_from, to: date_to },
          ...reportData
        }
      });

    } catch (error) {
      logger.error('Failed to generate report:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to generate report'));
      }
    }
  }

  // Helper method: Generate appointment report
  private async generateAppointmentReport(dateFrom?: string, dateTo?: string, departmentId?: string) {
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (dateFrom) {
      whereClause += ` AND DATE(a.appointment_datetime) >= $${params.length + 1}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ` AND DATE(a.appointment_datetime) <= $${params.length + 1}`;
      params.push(dateTo);
    }

    if (departmentId) {
      whereClause += ` AND d.department_id = $${params.length + 1}`;
      params.push(departmentId);
    }

    const query = `
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN a.status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled,
        d.name as department_name,
        COUNT(DISTINCT a.patient_id) as unique_patients,
        COUNT(DISTINCT a.doctor_id) as doctors_involved
      FROM appointments a
      JOIN doctors doc ON a.doctor_id = doc.doctor_id
      JOIN departments d ON doc.department_id = d.department_id
      ${whereClause}
      GROUP BY d.department_id, d.name
      ORDER BY total_appointments DESC
    `;

    const result = await dbClient.query(query, params);
    
    return {
      summary: result.rows,
      total_appointments: result.rows.reduce((sum, row) => sum + parseInt(row.total_appointments), 0)
    };
  }

  // Helper method: Generate patient report
  private async generatePatientReport(dateFrom?: string, dateTo?: string) {
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (dateFrom) {
      whereClause += ` AND DATE(u.created_at) >= $${params.length + 1}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ` AND DATE(u.created_at) <= $${params.length + 1}`;
      params.push(dateTo);
    }

    const query = `
      SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_patients,
        COUNT(CASE WHEN u.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
      FROM patients p
      JOIN users u ON p.patient_id = u.user_id
      ${whereClause}
    `;

    const result = await dbClient.query(query, params);
    
    return {
      summary: result.rows[0]
    };
  }

  // Helper method: Generate doctor report
  private async generateDoctorReport(dateFrom?: string, dateTo?: string, departmentId?: string) {
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (departmentId) {
      whereClause += ` AND d.department_id = $${params.length + 1}`;
      params.push(departmentId);
    }

    const query = `
      SELECT 
        COUNT(*) as total_doctors,
        COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_doctors,
        d.name as department_name,
        ROUND(AVG(doc.average_rating), 2) as avg_rating
      FROM doctors doc
      JOIN users u ON doc.doctor_id = u.user_id
      JOIN departments d ON doc.department_id = d.department_id
      ${whereClause}
      GROUP BY d.department_id, d.name
      ORDER BY total_doctors DESC
    `;

    const result = await dbClient.query(query, params);
    
    return {
      summary: result.rows
    };
  }
}

export default new AdminDashboardController(); 