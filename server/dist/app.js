"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = require("./routes");
const logger_1 = require("./utils/logger");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false // Allow cross-origin resource access
}));
// Enhanced CORS configuration
const allowedOrigins = [
    config_1.config.frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            logger_1.logger.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Request parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((0, morgan_1.default)('common'));
// Serve static files from uploads directory
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../public/images')));
// API routes
app.use(config_1.config.apiPrefix, (0, routes_1.setupRoutes)());
// Error handling
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(config_1.config.port, () => {
    logger_1.logger.info(`Server is running on port ${config_1.config.port}`);
    logger_1.logger.info(`Environment: ${config_1.config.nodeEnv}`);
});
//# sourceMappingURL=app.js.map