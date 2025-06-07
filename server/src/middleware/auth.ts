import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 获取令牌
    const authHeader = req.headers.authorization;
    logger.debug('[Auth] Authorization header:', authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('[Auth] No Bearer token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    logger.debug('[Auth] Token:', token);

    // 简化的认证方式 - 不再验证JWT
    // 只要有token即视为已认证，token格式应该是: user_id:email:role
    try {
      const [id, email, role] = token.split(':');
      logger.debug('[Auth] Parsed token:', { id, email, role });
      
      if (!id || !email || !role) {
        logger.warn('[Auth] Invalid token format - missing required parts');
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      // 添加用户信息到请求
      req.user = {
        id: parseInt(id),
        email,
        role,
      };
      
      logger.debug('[Auth] User authenticated:', req.user);
      next();
    } catch (error) {
      logger.error('[Auth] Token parsing error:', error);
      return res.status(401).json({ message: 'Invalid token format' });
    }
  } catch (error) {
    logger.error('[Auth] Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// 简化的角色检查
export const checkRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role.toLowerCase())) {
      logger.warn(`Access denied: User with role ${req.user.role} attempted to access a resource restricted to ${allowedRoles.join(', ')}`);
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    next();
  };
}; 