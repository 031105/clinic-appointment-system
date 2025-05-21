import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from './logger';

// 创建PostgreSQL连接池
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clinic_appointment_system',
  password: 'postgres',
  port: 5432,
});

// 添加连接池错误处理
pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

interface QueryOptions {
  limit?: number;
  offset?: number;
  roleId?: number;
  status?: string;
  patientId?: number;
  doctorId?: number;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 数据库访问类
 */
class DBClient {
  /**
   * 获取数据库客户端，用于事务处理
   * @returns {Promise<PoolClient>} 数据库客户端
   */
  async getClient(): Promise<PoolClient> {
    return await pool.connect();
  }
  
  /**
   * 执行SQL查询
   * @param {string} text 查询语句
   * @param {any[]} params 查询参数
   * @returns {Promise<QueryResult>} 查询结果
   */
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await pool.connect();
    try {
      logger.debug(`Executing query: ${text}`);
      if (params && params.length) {
        logger.debug(`Query params: ${JSON.stringify(params)}`);
      }
      
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug(`Query completed in ${duration}ms, returned ${result.rowCount} rows`);
      return result;
    } catch (error) {
      logger.error(`Query error: ${(error as Error).message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 获取所有用户
   * @param {QueryOptions} options 查询选项
   * @returns {Promise<any[]>} 用户列表
   */
  async getUsers(options: QueryOptions = {}): Promise<any[]> {
    const { limit = 10, offset = 0, roleId, status } = options;
    
    let query = `
      SELECT u.*, r.role_name, r.permissions as role_permissions
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (roleId) {
      query += ` AND u.role_id = $${params.length + 1}`;
      params.push(roleId);
    }
    
    if (status) {
      query += ` AND u.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY u.user_id
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * 根据ID获取用户
   * @param {number} userId 用户ID
   * @returns {Promise<any>} 用户信息
   */
  async getUserById(userId: number): Promise<any> {
    const query = `
      SELECT u.*, r.role_name, r.permissions as role_permissions
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1
    `;
    
    const result = await this.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * 根据邮箱获取用户
   * @param {string} email 用户邮箱
   * @returns {Promise<any>} 用户信息
   */
  async getUserByEmail(email: string): Promise<any> {
    const query = `
      SELECT u.*, r.role_name, r.permissions as role_permissions
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.email = $1
    `;
    
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  /**
   * 获取患者信息
   * @param {number} patientId 患者ID
   * @returns {Promise<any>} 患者信息
   */
  async getPatientProfile(patientId: number): Promise<any> {
    const query = `
      SELECT 
        p.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.profile_image,
        u.status,
        (SELECT COUNT(*) FROM patient_allergies WHERE patient_id = p.patient_id) as allergies_count,
        (SELECT COUNT(*) FROM emergency_contacts WHERE patient_id = p.patient_id) as emergency_contacts_count
      FROM patients p
      JOIN users u ON p.patient_id = u.user_id
      WHERE p.patient_id = $1
    `;
    
    const result = await this.query(query, [patientId]);
    return result.rows[0];
  }

  /**
   * 获取医生信息
   * @param {number} doctorId 医生ID
   * @returns {Promise<any>} 医生信息
   */
  async getDoctorProfile(doctorId: number): Promise<any> {
    const query = `
      SELECT 
        d.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.profile_image,
        u.status,
        dep.name as department_name,
        dep.description as department_description
      FROM doctors d
      JOIN users u ON d.doctor_id = u.user_id
      JOIN departments dep ON d.department_id = dep.department_id
      WHERE d.doctor_id = $1
    `;
    
    const result = await this.query(query, [doctorId]);
    return result.rows[0];
  }

  /**
   * 获取预约列表
   * @param {QueryOptions} options 查询选项
   * @returns {Promise<any[]>} 预约列表
   */
  async getAppointments(options: QueryOptions = {}): Promise<any[]> {
    const { 
      limit = 10, 
      offset = 0, 
      patientId, 
      doctorId, 
      status, 
      startDate, 
      endDate 
    } = options;
    
    let query = `
      SELECT 
        a.*,
        p.patient_id,
        d.doctor_id,
        pu.first_name as patient_first_name,
        pu.last_name as patient_last_name,
        pu.email as patient_email,
        du.first_name as doctor_first_name,
        du.last_name as doctor_last_name,
        du.email as doctor_email,
        dep.name as department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN users pu ON p.patient_id = pu.user_id
      JOIN users du ON d.doctor_id = du.user_id
      JOIN departments dep ON d.department_id = dep.department_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (patientId) {
      query += ` AND a.patient_id = $${params.length + 1}`;
      params.push(patientId);
    }
    
    if (doctorId) {
      query += ` AND a.doctor_id = $${params.length + 1}`;
      params.push(doctorId);
    }
    
    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }
    
    if (startDate) {
      query += ` AND a.appointment_datetime >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND a.appointment_datetime <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY a.appointment_datetime DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * 获取患者的医疗记录
   * @param {number} patientId 患者ID
   * @returns {Promise<any[]>} 医疗记录列表
   */
  async getPatientMedicalRecords(patientId: number): Promise<any[]> {
    const query = `
      SELECT 
        mr.*,
        du.first_name as doctor_first_name,
        du.last_name as doctor_last_name,
        dep.name as department_name,
        a.appointment_datetime,
        a.status as appointment_status
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.doctor_id
      JOIN users du ON d.doctor_id = du.user_id
      JOIN departments dep ON d.department_id = dep.department_id
      LEFT JOIN appointments a ON mr.appointment_id = a.appointment_id
      WHERE mr.patient_id = $1
      ORDER BY mr.date_of_record DESC
    `;
    
    const result = await this.query(query, [patientId]);
    return result.rows;
  }
  
  /**
   * 获取医生的时间表
   * @param {number} doctorId 医生ID
   * @returns {Promise<any[]>} 时间表列表
   */
  async getDoctorSchedules(doctorId: number): Promise<any[]> {
    const query = `
      SELECT * FROM doctor_schedules
      WHERE doctor_id = $1 AND is_active = true
      ORDER BY day_of_week, start_time
    `;
    
    const result = await this.query(query, [doctorId]);
    return result.rows;
  }
  
  /**
   * 获取医生的评价
   * @param {number} doctorId 医生ID
   * @param {number} limit 查询数量限制
   * @returns {Promise<any[]>} 评价列表
   */
  async getDoctorReviews(doctorId: number, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN users u ON p.patient_id = u.user_id
      WHERE r.doctor_id = $1 AND r.is_public = true
      ORDER BY r.created_at DESC
      LIMIT $2
    `;
    
    const result = await this.query(query, [doctorId, limit]);
    return result.rows;
  }
  
  /**
   * 获取部门列表
   * @returns {Promise<any[]>} 部门列表
   */
  async getDepartments(): Promise<any[]> {
    const query = `
      SELECT * FROM departments
      WHERE is_active = true
      ORDER BY name
    `;
    
    const result = await this.query(query);
    return result.rows;
  }
  
  /**
   * 获取用户通知
   * @param {number} userId 用户ID
   * @param {number} limit 查询数量限制
   * @returns {Promise<any[]>} 通知列表
   */
  async getUserNotifications(userId: number, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await this.query(query, [userId, limit]);
    return result.rows;
  }
}

// 导出单例实例
const dbClient = new DBClient();
export default dbClient; 