import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // This is needed because we're extending a built in class
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle different types of errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // Handle PostgreSQL errors
  if (err instanceof Error) {
    const pgError = err as any;
    
    // PostgreSQL unique constraint violation (code 23505)
    if (pgError.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Unique constraint violation',
        error: pgError.detail || 'A record with the same unique key already exists',
      });
    }
    
    // PostgreSQL foreign key violation (code 23503)
    if (pgError.code === '23503') {
      return res.status(400).json({
        status: 'error',
        message: 'Foreign key constraint violation',
        error: pgError.detail || 'Referenced record does not exist',
      });
    }
    
    // PostgreSQL not null violation (code 23502) 
    if (pgError.code === '23502') {
      return res.status(400).json({
        status: 'error',
        message: 'Not null constraint violation',
        error: pgError.detail || 'A required field is missing',
      });
    }
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}; 