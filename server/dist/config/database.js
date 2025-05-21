"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const db_client_1 = __importDefault(require("../utils/db-client"));
/**
 * 导出数据库客户端
 * 该文件是为了保持与原来导入路径的兼容性
 */
// 记录数据库初始化日志
logger_1.logger.info('Database client initialized');
exports.default = db_client_1.default;
//# sourceMappingURL=database.js.map