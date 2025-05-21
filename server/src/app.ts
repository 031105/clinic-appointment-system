import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';
import path from 'path';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow cross-origin resource access
}));

// Enhanced CORS configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('common'));

// Serve static files from uploads directory
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API routes
app.use(config.apiPrefix, setupRoutes());

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
}); 