"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientAppointmentsSchema = exports.getDoctorsSchema = void 0;
const zod_1 = require("zod");
// 查询参数schema
exports.getDoctorsSchema = zod_1.z.object({
    query: zod_1.z.object({
        departmentId: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        offset: zod_1.z.string().optional(),
    }),
});
exports.getPatientAppointmentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['upcoming', 'past', 'all']).optional().default('all'),
        limit: zod_1.z.string().optional(),
        offset: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=dashboard.schema.js.map