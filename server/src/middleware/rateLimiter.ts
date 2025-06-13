import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

// Simple in-memory store for rate limiting
// In production, use Redis or similar persistent storage
const attempts = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of attempts.entries()) {
    if (now > data.resetTime) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  message?: string; // Custom error message
}

export const createRateLimiter = (options: RateLimiterOptions) => {
  const {
    windowMs,
    maxAttempts,
    keyGenerator = (req) => req.ip || 'unknown',
    message = 'Too many requests, please try again later.',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create attempt record
    let record = attempts.get(key);
    
    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      attempts.set(key, record);
      return next();
    }
    
    // Increment attempt count
    record.count++;
    
    if (record.count > maxAttempts) {
      throw new ApiError(429, message);
    }
    
    next();
  };
};

// Specific rate limiter for password reset requests
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 3, // Maximum 3 attempts per 15 minutes per IP
  message: 'Too many password reset attempts. Please try again in 15 minutes.',
});

// More strict rate limiter for email-based requests
export const emailBasedRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 5, // Maximum 5 attempts per hour per email
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email ? `email:${email.toLowerCase().trim()}` : req.ip || 'unknown';
  },
  message: 'Too many requests for this email address. Please try again in 1 hour.',
}); 