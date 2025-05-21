"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const dashboard_schema_1 = require("../schemas/dashboard.schema");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 公共路由 - 不需要认证
router.get('/departments', dashboard_controller_1.getDepartments);
router.get('/doctors', (0, validate_1.validate)(dashboard_schema_1.getDoctorsSchema), dashboard_controller_1.getDoctors);
// 患者专用路由 - 需要认证
router.get('/patient-profile', auth_1.authenticate, dashboard_controller_1.getPatientProfile);
router.get('/patient-appointments', auth_1.authenticate, (0, validate_1.validate)(dashboard_schema_1.getPatientAppointmentsSchema), dashboard_controller_1.getPatientAppointments);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map