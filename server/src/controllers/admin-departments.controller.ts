import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { logger } from '../utils/logger';

// Department类型定义
interface Department {
  department_id: number;
  name: string;
  description: string;
  head_doctor_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  emoji_icon: string;
  doctor_count?: number;
  service_count?: number;
}

// Service类型定义
interface Service {
  service_id: number;
  department_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class AdminDepartmentsController {
  
  // 数据格式化函数
  private formatServiceName(name: string): string {
    return name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatServiceDescription(description: string): string {
    return description.trim();
  }

  private formatServicePrice(price: number): number {
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  private formatServiceDuration(duration: number): number {
    return Math.max(5, Math.round(duration)); // Minimum 5 minutes, rounded to integer
  }

  // 获取所有部门
  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('获取所有部门列表');
      
      const query = `
        SELECT 
          d.department_id,
          d.name,
          d.description,
          d.head_doctor_id,
          d.is_active,
          d.created_at,
          d.updated_at,
          d.emoji_icon,
          COUNT(DISTINCT doc.doctor_id) as doctor_count,
          COUNT(DISTINCT s.service_id) as service_count
        FROM departments d
        LEFT JOIN doctors doc ON d.department_id = doc.department_id
        LEFT JOIN services s ON d.department_id = s.department_id AND s.is_active = true
        WHERE d.is_active = true
        GROUP BY d.department_id, d.name, d.description, d.head_doctor_id, d.is_active, d.created_at, d.updated_at, d.emoji_icon
        ORDER BY d.department_id
      `;
      
      const result = await dbClient.query(query);
      
      logger.info(`获取到 ${result.rows.length} 个部门`);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      logger.error('获取部门列表失败:', error);
      next(new ApiError(500, '获取部门列表失败'));
    }
  }

  // 获取单个部门详情
  async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`获取部门详情: ${id}`);
      
      const query = `
        SELECT 
          d.department_id,
          d.name,
          d.description,
          d.head_doctor_id,
          d.is_active,
          d.created_at,
          d.updated_at,
          d.emoji_icon,
          COUNT(DISTINCT doc.doctor_id) as doctor_count,
          COUNT(DISTINCT s.service_id) as service_count
        FROM departments d
        LEFT JOIN doctors doc ON d.department_id = doc.department_id
        LEFT JOIN services s ON d.department_id = s.department_id AND s.is_active = true
        WHERE d.department_id = $1 AND d.is_active = true
        GROUP BY d.department_id, d.name, d.description, d.head_doctor_id, d.is_active, d.created_at, d.updated_at, d.emoji_icon
      `;
      
      const result = await dbClient.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new ApiError(404, '部门不存在');
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('获取部门详情失败:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '获取部门详情失败'));
      }
    }
  }

  // 创建部门
  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, emoji_icon, head_doctor_id } = req.body;
      logger.info(`创建新部门: ${name}`);
      
      // 检查部门名称是否已存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE name = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [name]);
      
      if (checkResult.rows.length > 0) {
        throw new ApiError(409, '部门名称已存在');
      }
      
      const insertQuery = `
        INSERT INTO departments (name, description, emoji_icon, head_doctor_id, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `;
      
      const result = await dbClient.query(insertQuery, [
        name,
        description || null,
        emoji_icon || '🏥',
        head_doctor_id || null
      ]);
      
      logger.info(`部门创建成功: ${name}`);
      
      res.status(201).json({
        success: true,
        message: '部门创建成功',
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('创建部门失败:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '创建部门失败'));
      }
    }
  }

  // 更新部门
  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, emoji_icon, head_doctor_id } = req.body;
      logger.info(`更新部门: ${id}`);
      
      // 检查部门是否存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, '部门不存在');
      }
      
      // 如果要更新名称，检查新名称是否已存在
      if (name) {
        const nameCheckQuery = `
          SELECT department_id FROM departments 
          WHERE name = $1 AND department_id != $2 AND is_active = true
        `;
        const nameCheckResult = await dbClient.query(nameCheckQuery, [name, id]);
        
        if (nameCheckResult.rows.length > 0) {
          throw new ApiError(409, '部门名称已存在');
        }
      }
      
      const updateQuery = `
        UPDATE departments 
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          emoji_icon = COALESCE($3, emoji_icon),
          head_doctor_id = COALESCE($4, head_doctor_id),
          updated_at = CURRENT_TIMESTAMP
        WHERE department_id = $5 AND is_active = true
        RETURNING *
      `;
      
      const result = await dbClient.query(updateQuery, [
        name || null,
        description || null,
        emoji_icon || null,
        head_doctor_id || null,
        id
      ]);
      
      logger.info(`部门更新成功: ${id}`);
      
      res.json({
        success: true,
        message: '部门更新成功',
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('更新部门失败:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '更新部门失败'));
      }
    }
  }

  // 软删除部门
  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`删除部门: ${id}`);
      
      // 检查部门是否存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, '部门不存在');
      }
      
      // 检查是否有医生关联到此部门
      const doctorCheckQuery = `
        SELECT COUNT(*) as doctor_count FROM doctors WHERE department_id = $1
      `;
      const doctorCheckResult = await dbClient.query(doctorCheckQuery, [id]);
      
      if (parseInt(doctorCheckResult.rows[0].doctor_count) > 0) {
        throw new ApiError(400, '无法删除有医生关联的部门');
      }
      
      // 软删除部门
      const deleteQuery = `
        UPDATE departments 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE department_id = $1
      `;
      
      await dbClient.query(deleteQuery, [id]);
      
      // 同时软删除该部门的所有服务
      const deleteServicesQuery = `
        UPDATE services 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE department_id = $1
      `;
      
      await dbClient.query(deleteServicesQuery, [id]);
      
      logger.info(`部门删除成功: ${id}`);
      
      res.json({
        success: true,
        message: '部门删除成功'
      });
      
    } catch (error) {
      logger.error('删除部门失败:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '删除部门失败'));
      }
    }
  }

  // 获取部门服务列表
  async getDepartmentServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`Getting department services: ${id}`);
      
      // 检查部门是否存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Department not found');
      }
      
      const query = `
        SELECT 
          service_id,
          department_id,
          name,
          description,
          price,
          duration,
          is_active,
          created_at,
          updated_at
        FROM services
        WHERE department_id = $1 AND is_active = true
        ORDER BY name
      `;
      
      const result = await dbClient.query(query, [id]);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      logger.error('Failed to get department services:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to get department services'));
      }
    }
  }

  // 创建部门服务
  async createDepartmentService(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params;
      const { name, description, price, duration } = req.body;
      logger.info(`Creating department service: ${name} for department ${departmentId}`);
      
      // 格式化输入数据
      const formattedName = this.formatServiceName(name);
      const formattedDescription = description ? this.formatServiceDescription(description) : null;
      const formattedPrice = this.formatServicePrice(price);
      const formattedDuration = this.formatServiceDuration(duration);
      
      // 检查部门是否存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [departmentId]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Department not found');
      }
      
      const insertQuery = `
        INSERT INTO services (department_id, name, description, price, duration, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING *
      `;
      
      const result = await dbClient.query(insertQuery, [
        departmentId,
        formattedName,
        formattedDescription,
        formattedPrice,
        formattedDuration
      ]);
      
      logger.info(`Department service created successfully: ${formattedName}`);
      
      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('Failed to create department service:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to create department service'));
      }
    }
  }

  // 更新部门服务
  async updateDepartmentService(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId, serviceId } = req.params;
      const { name, description, price, duration } = req.body;
      
      logger.info(`Updating department service: ${serviceId} in department ${departmentId}`);
      logger.info(`Request body:`, req.body);
      
      // 格式化输入数据
      const formattedName = name ? this.formatServiceName(name) : null;
      const formattedDescription = description !== undefined ? 
        (description ? this.formatServiceDescription(description) : '') : null;
      const formattedPrice = price !== undefined ? this.formatServicePrice(price) : null;
      const formattedDuration = duration !== undefined ? this.formatServiceDuration(duration) : null;
      
      logger.info(`Formatted fields:`, { 
        formattedName, 
        formattedDescription, 
        formattedPrice, 
        formattedDuration 
      });
      
      // 检查服务是否存在
      const checkQuery = `
        SELECT service_id, name, description, price, duration FROM services 
        WHERE service_id = $1 AND department_id = $2 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [serviceId, departmentId]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Service not found');
      }
      
      const existingService = checkResult.rows[0];
      logger.info(`Existing service:`, existingService);
      
      const updateQuery = `
        UPDATE services 
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          duration = COALESCE($4, duration),
          updated_at = CURRENT_TIMESTAMP
        WHERE service_id = $5 AND department_id = $6 AND is_active = true
        RETURNING *
      `;
      
      const queryParams = [
        formattedName,
        formattedDescription,
        formattedPrice,
        formattedDuration,
        serviceId,
        departmentId
      ];
      
      logger.info(`SQL query parameters:`, queryParams);
      
      const result = await dbClient.query(updateQuery, queryParams);
      
      logger.info(`Department service updated successfully: ${serviceId}`);
      logger.info(`Updated service data:`, result.rows[0]);
      
      res.json({
        success: true,
        message: 'Service updated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      logger.error('Failed to update department service:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to update department service'));
      }
    }
  }

  // 删除部门服务
  async deleteDepartmentService(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId, serviceId } = req.params;
      logger.info(`Deleting department service: ${serviceId}`);
      
      // 检查服务是否存在
      const checkQuery = `
        SELECT service_id FROM services 
        WHERE service_id = $1 AND department_id = $2 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [serviceId, departmentId]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Service not found');
      }
      
      // 软删除服务
      const deleteQuery = `
        UPDATE services 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE service_id = $1 AND department_id = $2
      `;
      
      await dbClient.query(deleteQuery, [serviceId, departmentId]);
      
      logger.info(`Department service deleted successfully: ${serviceId}`);
      
      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
      
    } catch (error) {
      logger.error('Failed to delete department service:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to delete department service'));
      }
    }
  }

  // 获取部门统计信息
  async getDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`获取部门统计信息: ${id}`);
      
      // 检查部门是否存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, '部门不存在');
      }
      
      // 获取统计信息
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM doctors WHERE department_id = $1) as doctor_count,
          (SELECT COUNT(*) FROM services WHERE department_id = $1 AND is_active = true) as service_count,
          (SELECT COUNT(*) FROM appointments a 
           JOIN doctors d ON a.doctor_id = d.doctor_id 
           WHERE d.department_id = $1) as total_appointments,
          (SELECT COUNT(*) FROM appointments a 
           JOIN doctors d ON a.doctor_id = d.doctor_id 
           WHERE d.department_id = $1 AND a.status = 'completed') as completed_appointments
      `;
      
      const statsResult = await dbClient.query(statsQuery, [id]);
      
      res.json({
        success: true,
        data: statsResult.rows[0]
      });
      
    } catch (error) {
      logger.error('获取部门统计信息失败:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, '获取部门统计信息失败'));
      }
    }
  }

  // 获取部门下的所有医生
  async getDepartmentDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info(`Getting department doctors: ${id}`);
      
      // 检查部门是否存在
      const checkQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkResult = await dbClient.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Department not found');
      }
      
      const query = `
        SELECT 
          d.doctor_id,
          d.specialty,
          d.license_number,
          d.qualification,
          d.experience,
          d.consultation_fee,
          d.bio,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.status,
          u.created_at
        FROM doctors d
        JOIN users u ON d.doctor_id = u.user_id
        WHERE d.department_id = $1
        ORDER BY u.last_name, u.first_name
      `;
      
      const result = await dbClient.query(query, [id]);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      logger.error('Failed to get department doctors:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to get department doctors'));
      }
    }
  }

  // 获取未分配的医生列表
  async getUnassignedDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Getting unassigned doctors');
      
      const query = `
        SELECT 
          u.user_id as doctor_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.status,
          u.created_at,
          d.specialty,
          d.license_number,
          d.qualification,
          d.experience,
          d.consultation_fee,
          d.bio
        FROM users u
        LEFT JOIN doctors d ON u.user_id = d.doctor_id
        WHERE u.role_id = 2 
        AND u.status = 'active'
        AND (d.department_id IS NULL OR d.department_id = 14)
        ORDER BY u.last_name, u.first_name
      `;
      
      const result = await dbClient.query(query);
      
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      logger.error('Failed to get unassigned doctors:', error);
      next(new ApiError(500, 'Failed to get unassigned doctors'));
    }
  }

  // 分配医生到部门
  async assignDoctorToDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.params;
      const { doctorId } = req.body;
      logger.info(`Assigning doctor ${doctorId} to department ${departmentId}`);
      
      // 检查部门是否存在
      const checkDeptQuery = `
        SELECT department_id FROM departments WHERE department_id = $1 AND is_active = true
      `;
      const checkDeptResult = await dbClient.query(checkDeptQuery, [departmentId]);
      
      if (checkDeptResult.rows.length === 0) {
        throw new ApiError(404, 'Department not found');
      }
      
      // 检查医生是否存在且未分配或在未分配部门
      const checkDoctorQuery = `
        SELECT d.doctor_id, d.department_id, u.first_name, u.last_name
        FROM doctors d
        JOIN users u ON d.doctor_id = u.user_id
        WHERE d.doctor_id = $1 AND u.status = 'active'
      `;
      const checkDoctorResult = await dbClient.query(checkDoctorQuery, [doctorId]);
      
      if (checkDoctorResult.rows.length === 0) {
        throw new ApiError(404, 'Doctor not found');
      }
      
      const doctor = checkDoctorResult.rows[0];
      if (doctor.department_id && doctor.department_id !== 14) {
        throw new ApiError(400, 'Doctor is already assigned to another department');
      }
      
      // 更新医生的部门
      const updateQuery = `
        UPDATE doctors 
        SET department_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE doctor_id = $2
      `;
      
      await dbClient.query(updateQuery, [departmentId, doctorId]);
      
      logger.info(`Doctor assigned successfully: ${doctor.first_name} ${doctor.last_name} -> department ${departmentId}`);
      
      res.json({
        success: true,
        message: 'Doctor assigned successfully'
      });
      
    } catch (error) {
      logger.error('Failed to assign doctor:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to assign doctor'));
      }
    }
  }

  // 将医生从部门移除
  async removeDoctorFromDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId, doctorId } = req.params;
      logger.info(`Removing doctor ${doctorId} from department ${departmentId}`);
      
      // 检查医生是否在指定部门
      const checkQuery = `
        SELECT d.doctor_id, u.first_name, u.last_name
        FROM doctors d
        JOIN users u ON d.doctor_id = u.user_id
        WHERE d.doctor_id = $1 AND d.department_id = $2 AND u.status = 'active'
      `;
      const checkResult = await dbClient.query(checkQuery, [doctorId, departmentId]);
      
      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Doctor not found in specified department');
      }
      
      const doctor = checkResult.rows[0];
      
      // 检查是否有未完成的预约
      const appointmentCheckQuery = `
        SELECT COUNT(*) as active_appointments
        FROM appointments 
        WHERE doctor_id = $1 AND status IN ('pending', 'confirmed', 'in_progress')
      `;
      const appointmentCheckResult = await dbClient.query(appointmentCheckQuery, [doctorId]);
      
      if (parseInt(appointmentCheckResult.rows[0].active_appointments) > 0) {
        throw new ApiError(400, 'Doctor has active appointments and cannot be removed');
      }
      
      // 将医生移动到未分配部门 (department_id = 14)
      const updateQuery = `
        UPDATE doctors 
        SET department_id = 14, updated_at = CURRENT_TIMESTAMP
        WHERE doctor_id = $1
      `;
      
      await dbClient.query(updateQuery, [doctorId]);
      
      logger.info(`Doctor removed successfully: ${doctor.first_name} ${doctor.last_name} from department ${departmentId}`);
      
      res.json({
        success: true,
        message: 'Doctor removed successfully'
      });
      
    } catch (error) {
      logger.error('Failed to remove doctor:', error);
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(new ApiError(500, 'Failed to remove doctor'));
      }
    }
  }
} 