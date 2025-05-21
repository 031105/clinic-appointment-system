"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 获取预约详情
router.get('/:id', auth_1.authenticate, appointment_controller_1.getAppointmentById);
// 创建新预约
router.post('/', auth_1.authenticate, appointment_controller_1.createAppointment);
// 取消预约
router.post('/:id/cancel', auth_1.authenticate, appointment_controller_1.cancelAppointment);
// 重新安排预约
router.post('/:id/reschedule', auth_1.authenticate, appointment_controller_1.rescheduleAppointment);
// 确认预约
router.post('/:id/confirm', auth_1.authenticate, appointment_controller_1.confirmAppointment);
// 获取医生可用时间段
router.get('/doctors/:doctorId/available-slots', appointment_controller_1.getDoctorAvailableSlots);
// 获取预约相关的医疗记录
router.get('/:id/medical-record', auth_1.authenticate, appointment_controller_1.getAppointmentMedicalRecord);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map