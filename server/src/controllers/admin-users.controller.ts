import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

// User类型定义
interface AdminUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

interface DoctorUser extends AdminUser {
  specialty?: string;
  experience?: number;
  consultation_fee?: number;
  department_id?: number;
  department_name?: string;
}

export class AdminUsersController {
  
  // 获取所有管理员用户
  async getAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting admin users');
      
      const query = `
        SELECT 
          u.user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.status,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE r.role_name = 'admin'
        ORDER BY u.created_at DESC
      `;
      
      const result = await dbClient.query(query);
      
      logger.info(`Retrieved ${result.rows.length} admin users`);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      logger.error('Failed to get admin users:', error);
      next(new ApiError(500, 'Failed to get admin users'));
    }
  }

  // 获取所有医生用户
  async getDoctorUsers(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting doctor users');
      
      const query = `
        SELECT 
          u.user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.status,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          r.role_name,
          d.specialty,
          d.experience,
          d.consultation_fee,
          d.department_id,
          dept.name as department_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN doctors d ON u.user_id = d.doctor_id
        LEFT JOIN departments dept ON d.department_id = dept.department_id
        WHERE r.role_name = 'doctor'
        ORDER BY u.created_at DESC
      `;
      
      const result = await dbClient.query(query);
      
      logger.info(`Retrieved ${result.rows.length} doctor users`);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      logger.error('Failed to get doctor users:', error);
      next(new ApiError(500, 'Failed to get doctor users'));
    }
  }

  // 获取单个用户详情
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`Getting user details: ${id}`);
      
      const query = `
        SELECT 
          u.user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.address,
          u.status,
          u.created_at,
          u.updated_at,
          u.last_login_at,
          r.role_name,
          d.specialty,
          d.experience,
          d.consultation_fee,
          d.department_id,
          dept.name as department_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN doctors d ON u.user_id = d.doctor_id
        LEFT JOIN departments dept ON d.department_id = dept.department_id
        WHERE u.user_id = $1
      `;
      
      const result = await dbClient.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new ApiError(404, 'User not found');
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('Failed to get user details:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to get user details'));
      }
    }
  }

  // 创建新用户
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phone, 
        role, 
        doctorInfo 
      } = req.body;
      
      logger.info(`Creating new user: ${email} with role: ${role}`);
      
      // Format the input data
      const formattedEmail = email.toLowerCase().trim();
      const formattedFirstName = this.formatName(firstName);
      const formattedLastName = this.formatName(lastName);
      const formattedPhone = phone ? this.formatPhone(phone) : null;
      const formattedDoctorInfo = doctorInfo ? {
        ...doctorInfo,
        specialty: doctorInfo.specialty ? this.formatSpecialty(doctorInfo.specialty) : null
      } : null;
      
      // 检查邮箱是否已存在
      const emailCheckQuery = `
        SELECT user_id FROM users WHERE email = $1
      `;
      const emailCheckResult = await dbClient.query(emailCheckQuery, [formattedEmail]);
      
      if (emailCheckResult.rows.length > 0) {
        throw new ApiError(409, 'Email already exists');
      }
      
      // 获取角色ID
      const roleQuery = `
        SELECT role_id FROM roles WHERE role_name = $1
      `;
      const roleResult = await dbClient.query(roleQuery, [role]);
      
      if (roleResult.rows.length === 0) {
        throw new ApiError(400, 'Invalid role');
      }
      
      const roleId = roleResult.rows[0].role_id;
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 开始事务
      const client = await dbClient.getClient();
      
      try {
        await client.query('BEGIN');
        
        // 创建用户
        const createUserQuery = `
          INSERT INTO users (
            email, password_hash, first_name, last_name, phone, role_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
          RETURNING user_id, email, first_name, last_name, created_at
        `;
        
        const userResult = await client.query(createUserQuery, [
          formattedEmail,
          hashedPassword,
          formattedFirstName,
          formattedLastName,
          formattedPhone,
          roleId
        ]);
        
        const newUser = userResult.rows[0];
        const userId = newUser.user_id;
        
        // 如果是医生，创建医生记录
        if (role === 'doctor' && formattedDoctorInfo) {
          const createDoctorQuery = `
            INSERT INTO doctors (
              doctor_id, specialty, experience, consultation_fee, department_id
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          
          await client.query(createDoctorQuery, [
            userId,
            formattedDoctorInfo.specialty || null,
            formattedDoctorInfo.experience || null,
            formattedDoctorInfo.consultation_fee || null,
            formattedDoctorInfo.department_id || 14 // 未分配部门
          ]);
        }
        
        await client.query('COMMIT');
        
        logger.info(`User created successfully: ${formattedEmail}`);
        
        res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: newUser
        });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      logger.error('Failed to create user:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to create user'));
      }
    }
  }

  // Helper methods for data formatting
  private formatName(name: string): string {
    return name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatPhone(phone: string): string {
    if (!phone) return '';
    // Remove all non-digit characters except + at the beginning
    const cleaned = phone.replace(/[^\d+]/g, '');
    // If it starts with +, keep it, otherwise remove any + in the middle
    if (cleaned.startsWith('+')) {
      return '+' + cleaned.substring(1).replace(/\+/g, '');
    }
    return cleaned.replace(/\+/g, '');
  }

  private formatSpecialty(specialty: string): string {
    return specialty.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // 更新用户状态
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      logger.info(`Updating user status: ${id} to ${status}`);
      
      // 验证状态值
      if (!['active', 'inactive'].includes(status)) {
        throw new ApiError(400, 'Invalid status value');
      }
      
      const updateQuery = `
        UPDATE users 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
        RETURNING user_id, email, status
      `;
      
      const result = await dbClient.query(updateQuery, [status, id]);
      
      if (result.rows.length === 0) {
        throw new ApiError(404, 'User not found');
      }
      
      logger.info(`User status updated successfully: ${id}`);
      
      res.json({
        success: true,
        message: 'User status updated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('Failed to update user status:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to update user status'));
      }
    }
  }
} 