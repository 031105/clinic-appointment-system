import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
    file?: Express.Multer.File;
}
export declare class UserController {
    getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    uploadProfileImageBlob(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getProfileImageBlob(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
export {};
