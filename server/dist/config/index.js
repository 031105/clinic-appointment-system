"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    api: {
        url: process.env.API_URL || 'http://localhost:4000/api/v1',
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/clinic_appointment_system?schema=public',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        resetSecret: process.env.JWT_RESET_SECRET || 'your-reset-secret-key',
        verifyEmailSecret: process.env.JWT_VERIFY_EMAIL_SECRET || 'your-verify-email-secret',
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password',
        from: process.env.EMAIL_FROM || 'noreply@example.com',
    },
    upload: {
        directory: process.env.UPLOAD_DIR || 'uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        file: process.env.LOG_FILE || 'logs/app.log',
    },
};
//# sourceMappingURL=index.js.map