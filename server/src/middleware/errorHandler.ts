import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public errors?: any
  ) {
    super(message);
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

  // Handle Prisma errors
  if (err instanceof Error) {
    if (err.name === 'PrismaClientKnownRequestError') {
      const prismaError = err as Prisma.PrismaClientKnownRequestError;
      switch (prismaError.code) {
        case 'P2002':
          return res.status(409).json({
            status: 'error',
            message: 'Unique constraint violation',
            error: `A record with this ${(prismaError.meta as any)?.target} already exists`,
          });
        case 'P2025':
          return res.status(404).json({
            status: 'error',
            message: 'Record not found',
          });
        default:
          return res.status(500).json({
            status: 'error',
            message: 'Database error',
          });
      }
    }

    if (err.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data provided',
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