import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class ReportController {
  // Get appointment statistics by department
  async getAppointmentsByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
      const end = endDate ? new Date(endDate as string) : new Date();

      const departmentStats = await prisma.$queryRaw`
        SELECT 
          d.id, 
          d.name as department_name, 
          COUNT(a.id) as appointment_count,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_count,
          COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_count
        FROM departments d
        LEFT JOIN doctors doc ON doc.department_id = d.id
        LEFT JOIN appointments a ON a.doctor_id = doc.id AND a.appointment_datetime BETWEEN ${start} AND ${end}
        GROUP BY d.id, d.name
        ORDER BY appointment_count DESC
      `;

      res.json({
        status: 'success',
        data: departmentStats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get doctor performance report
  async getDoctorPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, departmentId } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
      const end = endDate ? new Date(endDate as string) : new Date();
      
      let whereClause = '';
      if (departmentId) {
        whereClause = `WHERE doc.department_id = ${parseInt(departmentId as string)}`;
      }

      const doctorStats = await prisma.$queryRaw`
        SELECT 
          doc.id,
          u.first_name,
          u.last_name,
          d.name as department_name,
          COUNT(a.id) as appointment_count,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_count,
          COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_count,
          AVG(r.rating) as average_rating,
          COUNT(r.id) as review_count
        FROM doctors doc
        JOIN users u ON u.id = doc.id
        JOIN departments d ON d.id = doc.department_id
        LEFT JOIN appointments a ON a.doctor_id = doc.id AND a.appointment_datetime BETWEEN ${start} AND ${end}
        LEFT JOIN reviews r ON r.doctor_id = doc.id AND r.is_public = true
        ${whereClause ? prisma.$raw`${whereClause}` : prisma.$raw``}
        GROUP BY doc.id, u.first_name, u.last_name, d.name
        ORDER BY appointment_count DESC
      `;

      res.json({
        status: 'success',
        data: doctorStats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get revenue report
  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      const end = endDate ? new Date(endDate as string) : new Date();
      
      let timeFormat;
      if (groupBy === 'day') {
        timeFormat = 'YYYY-MM-DD';
      } else if (groupBy === 'week') {
        timeFormat = 'YYYY-WW';
      } else if (groupBy === 'year') {
        timeFormat = 'YYYY';
      } else {
        // Default to month
        timeFormat = 'YYYY-MM';
      }

      const revenueData = await prisma.$queryRaw`
        SELECT 
          to_char(a.appointment_datetime, ${timeFormat}) as time_period,
          COUNT(a.id) as appointment_count,
          SUM(doc.consultation_fee) as revenue
        FROM appointments a
        JOIN doctors doc ON doc.id = a.doctor_id
        WHERE a.status = 'completed' AND a.appointment_datetime BETWEEN ${start} AND ${end}
        GROUP BY time_period
        ORDER BY time_period
      `;

      res.json({
        status: 'success',
        data: revenueData,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get patient demographics
  async getPatientDemographics(req: Request, res: Response, next: NextFunction) {
    try {
      // Age distribution
      const ageDistribution = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) < 18 THEN '0-17'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 18 AND 30 THEN '18-30'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 31 AND 45 THEN '31-45'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) BETWEEN 46 AND 60 THEN '46-60'
            ELSE '60+'
          END as age_group,
          COUNT(*) as patient_count
        FROM patients p
        GROUP BY age_group
        ORDER BY age_group
      `;

      // Gender distribution (assuming gender is stored in user profile or patient medical history)
      const genderDistribution = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN p.medical_history->>'gender' = 'male' THEN 'Male'
            WHEN p.medical_history->>'gender' = 'female' THEN 'Female'
            ELSE 'Other/Undisclosed'
          END as gender,
          COUNT(*) as patient_count
        FROM patients p
        GROUP BY gender
        ORDER BY patient_count DESC
      `;

      // Top conditions (based on diagnoses in medical records)
      const topConditions = await prisma.$queryRaw`
        SELECT 
          diagnosis,
          COUNT(*) as occurrence_count
        FROM (
          SELECT jsonb_array_elements_text(m.diagnosis::jsonb) as diagnosis
          FROM medical_records m
        ) as diagnoses
        GROUP BY diagnosis
        ORDER BY occurrence_count DESC
        LIMIT 10
      `;

      res.json({
        status: 'success',
        data: {
          ageDistribution,
          genderDistribution,
          topConditions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get appointment trends
  async getAppointmentTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 12 } = req.query;
      const months = parseInt(period as string) || 12;
      
      // Monthly appointment volume for the past year
      const monthlyVolume = await prisma.$queryRaw`
        SELECT 
          to_char(a.appointment_datetime, 'YYYY-MM') as month,
          COUNT(*) as appointment_count
        FROM appointments a
        WHERE a.appointment_datetime >= NOW() - INTERVAL '${months} months'
        GROUP BY month
        ORDER BY month
      `;

      // Appointment distribution by day of week
      const dayOfWeekDistribution = await prisma.$queryRaw`
        SELECT 
          EXTRACT(DOW FROM a.appointment_datetime) as day_of_week,
          COUNT(*) as appointment_count
        FROM appointments a
        WHERE a.appointment_datetime >= NOW() - INTERVAL '${months} months'
        GROUP BY day_of_week
        ORDER BY day_of_week
      `;

      // Appointment distribution by hour of day
      const hourDistribution = await prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM a.appointment_datetime) as hour_of_day,
          COUNT(*) as appointment_count
        FROM appointments a
        WHERE a.appointment_datetime >= NOW() - INTERVAL '${months} months'
        GROUP BY hour_of_day
        ORDER BY hour_of_day
      `;

      res.json({
        status: 'success',
        data: {
          monthlyVolume,
          dayOfWeekDistribution,
          hourDistribution,
        },
      });
    } catch (error) {
      next(error);
    }
  }
} 