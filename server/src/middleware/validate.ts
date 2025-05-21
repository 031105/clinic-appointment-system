import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { logger } from '../utils/logger';

/**
 * 验证请求中间件
 * 根据传入的schema验证请求参数
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证请求参数
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      logger.error('Validation error:', error);
      
      // 返回验证错误
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors || error.message,
      });
    }
  };
}; 