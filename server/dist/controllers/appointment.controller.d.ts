import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: number;
        userId?: number;
        email: string;
        role: string;
    };
}
/**
 * 获取预约详情
 */
export declare const getAppointmentById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 创建新的预约
 */
export declare const createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 取消预约
 */
export declare const cancelAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 重新安排预约
 */
export declare const rescheduleAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 确认预约
 */
export declare const confirmAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取医生可用时间段
 */
export declare const getDoctorAvailableSlots: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取预约相关的医疗记录
 */
export declare const getAppointmentMedicalRecord: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
