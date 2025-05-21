import { PoolClient, QueryResult } from 'pg';
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
declare class DBClient {
    /**
     * 获取数据库客户端，用于事务处理
     * @returns {Promise<PoolClient>} 数据库客户端
     */
    getClient(): Promise<PoolClient>;
    /**
     * 执行SQL查询
     * @param {string} text 查询语句
     * @param {any[]} params 查询参数
     * @returns {Promise<QueryResult>} 查询结果
     */
    query(text: string, params?: any[]): Promise<QueryResult>;
    /**
     * 获取所有用户
     * @param {QueryOptions} options 查询选项
     * @returns {Promise<any[]>} 用户列表
     */
    getUsers(options?: QueryOptions): Promise<any[]>;
    /**
     * 根据ID获取用户
     * @param {number} userId 用户ID
     * @returns {Promise<any>} 用户信息
     */
    getUserById(userId: number): Promise<any>;
    /**
     * 根据邮箱获取用户
     * @param {string} email 用户邮箱
     * @returns {Promise<any>} 用户信息
     */
    getUserByEmail(email: string): Promise<any>;
    /**
     * 获取患者信息
     * @param {number} patientId 患者ID
     * @returns {Promise<any>} 患者信息
     */
    getPatientProfile(patientId: number): Promise<any>;
    /**
     * 获取医生信息
     * @param {number} doctorId 医生ID
     * @returns {Promise<any>} 医生信息
     */
    getDoctorProfile(doctorId: number): Promise<any>;
    /**
     * 获取预约列表
     * @param {QueryOptions} options 查询选项
     * @returns {Promise<any[]>} 预约列表
     */
    getAppointments(options?: QueryOptions): Promise<any[]>;
    /**
     * 获取患者的医疗记录
     * @param {number} patientId 患者ID
     * @returns {Promise<any[]>} 医疗记录列表
     */
    getPatientMedicalRecords(patientId: number): Promise<any[]>;
    /**
     * 获取医生的时间表
     * @param {number} doctorId 医生ID
     * @returns {Promise<any[]>} 时间表列表
     */
    getDoctorSchedules(doctorId: number): Promise<any[]>;
    /**
     * 获取医生的评价
     * @param {number} doctorId 医生ID
     * @param {number} limit 查询数量限制
     * @returns {Promise<any[]>} 评价列表
     */
    getDoctorReviews(doctorId: number, limit?: number): Promise<any[]>;
    /**
     * 获取部门列表
     * @returns {Promise<any[]>} 部门列表
     */
    getDepartments(): Promise<any[]>;
    /**
     * 获取用户通知
     * @param {number} userId 用户ID
     * @param {number} limit 查询数量限制
     * @returns {Promise<any[]>} 通知列表
     */
    getUserNotifications(userId: number, limit?: number): Promise<any[]>;
}
declare const dbClient: DBClient;
export default dbClient;
