"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_client_1 = __importDefault(require("./db-client"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
/**
 * 运行SQL迁移脚本
 * @param fileName 迁移脚本文件名
 */
async function runMigration(fileName) {
    // 构建SQL文件路径
    const filePath = path_1.default.join(__dirname, '../../db', fileName);
    // 检查文件是否存在
    if (!fs_1.default.existsSync(filePath)) {
        logger_1.logger.error(`Migration file not found: ${filePath}`);
        return;
    }
    // 读取SQL脚本内容
    const sql = fs_1.default.readFileSync(filePath, 'utf8');
    // 获取数据库连接
    const client = await db_client_1.default.getClient();
    try {
        logger_1.logger.info(`Running migration: ${fileName}`);
        // 开始事务
        await client.query('BEGIN');
        // 执行SQL脚本
        await client.query(sql);
        // 提交事务
        await client.query('COMMIT');
        logger_1.logger.info(`Migration completed successfully: ${fileName}`);
    }
    catch (error) {
        // 回滚事务
        await client.query('ROLLBACK');
        logger_1.logger.error(`Migration failed: ${fileName}`, error);
        throw error;
    }
    finally {
        // 释放客户端连接
        client.release();
    }
}
// 如果直接运行此脚本，执行参数中指定的迁移
if (require.main === module) {
    const fileName = process.argv[2];
    if (!fileName) {
        logger_1.logger.error('Please provide a migration file name as argument');
        process.exit(1);
    }
    runMigration(fileName)
        .then(() => process.exit(0))
        .catch(err => {
        logger_1.logger.error('Migration error:', err);
        process.exit(1);
    });
}
exports.default = runMigration;
//# sourceMappingURL=run-migration.js.map