"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
// Custom API Error class
class ApiError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        // This is needed because we're extending a built in class
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
// Error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log error
    logger_1.logger.error('Error:', {
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
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.errors,
        });
    }
    // Handle PostgreSQL errors
    if (err instanceof Error) {
        const pgError = err;
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map