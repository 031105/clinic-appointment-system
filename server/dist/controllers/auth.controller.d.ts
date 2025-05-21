import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    private generateAccessToken;
    private generateRefreshToken;
    private sendVerificationEmail;
    private sendPasswordResetEmail;
}
