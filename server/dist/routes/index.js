"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const appointment_routes_1 = __importDefault(require("./appointment.routes"));
const patient_routes_1 = __importDefault(require("./patient.routes"));
const patient_setting_routes_1 = __importDefault(require("./patient-setting.routes"));
const logger_1 = require("../utils/logger");
const setupRoutes = () => {
    const router = (0, express_1.Router)();
    // Health check route
    router.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Auth routes (public)
    router.use('/auth', auth_routes_1.default);
    // User routes (some protected, some public)
    router.use('/users', user_routes_1.default);
    // Dashboard routes - 分离公共和受保护的路由
    router.use('/dashboard', dashboard_routes_1.default);
    // 预约路由
    router.use('/appointments', appointment_routes_1.default);
    // 患者设置路由
    router.use('/patients', patient_routes_1.default);
    // 患者个人设置路由
    logger_1.logger.info('注册患者个人设置路由: /patient-setting');
    router.use('/patient-setting', patient_setting_routes_1.default);
    return router;
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map