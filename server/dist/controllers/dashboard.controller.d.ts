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
 * 获取所有部门列表
 */
export declare const getDepartments: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取医生列表，可按部门筛选
 */
export declare const getDoctors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取患者预约列表
 */
export declare const getPatientAppointments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取患者个人资料
 */
export declare const getPatientProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
