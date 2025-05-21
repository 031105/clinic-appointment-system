import { logger } from '../utils/logger';
import dbClient from '../utils/db-client';

/**
 * 导出数据库客户端
 * 该文件是为了保持与原来导入路径的兼容性
 */

// 记录数据库初始化日志
logger.info('Database client initialized');

export default dbClient; 