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
 * 获取患者个人资料
 */
export declare const getPatientProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 用户个人资料API
 */
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 过敏信息API
 */
export declare const getAllergies: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addAllergy: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAllergy: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAllergy: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 紧急联系人API
 */
export declare const getEmergencyContacts: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addEmergencyContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateEmergencyContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteEmergencyContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
