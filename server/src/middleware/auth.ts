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

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 简化的认证方式 - 不再验证JWT
    // 只要有token即视为已认证，token格式应该是: user_id:email:role
    try {
      const [id, email, role] = token.split(':');
      
      if (!id || !email || !role) {
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      // 添加用户信息到请求
      req.user = {
        id: parseInt(id),
        email,
        role,
      };
      
      next();
    } catch (error) {
      logger.error('Token parsing error:', error);
      return res.status(401).json({ message: 'Invalid token format' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
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