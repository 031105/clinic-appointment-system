"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const logger_1 = require("../utils/logger");
/**
 * 验证请求中间件
 * 根据传入的schema验证请求参数
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // 验证请求参数
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            logger_1.logger.error('Validation error:', error);
            // 返回验证错误
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors || error.message,
            });
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map