import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';

export const validateDoctorRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  logger.debug('[RoleValidator] Checking doctor role:', {
    user: req.user,
    path: req.path,
    method: req.method
  });

  if (!req.user) {
    logger.warn('[RoleValidator] No user found in request');
    return res.status(403).json({ message: 'Access denied. Authentication required.' });
  }

  if (req.user.role.toLowerCase() !== 'doctor') {
    logger.warn('[RoleValidator] Invalid role:', {
      required: 'doctor',
      actual: req.user.role
    });
    return res.status(403).json({ message: 'Access denied. Doctor role required.' });
  }

  logger.debug('[RoleValidator] Role validation passed');
  next();
}; 