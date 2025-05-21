import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
/**
 * 验证请求中间件
 * 根据传入的schema验证请求参数
 */
export declare const validate: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
