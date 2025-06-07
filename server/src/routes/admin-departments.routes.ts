import { Router } from 'express';
import { AdminDepartmentsController } from '../controllers/admin-departments.controller';
import { validate } from '../middleware/validate';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
  createServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
  departmentStatsSchema,
  departmentServicesSchema
} from '../schemas/departments.schema';

const router = Router();
const adminDepartmentsController = new AdminDepartmentsController();

// ================================
// 部门管理路由
// ================================

// 获取未分配的医生列表 (必须在参数化路由之前)
router.get(
  '/unassigned/doctors',
  adminDepartmentsController.getUnassignedDoctors
);

// 获取所有部门
router.get(
  '/',
  adminDepartmentsController.getDepartments
);

// 获取单个部门详情
router.get(
  '/:id',
  validate(departmentIdParamSchema),
  adminDepartmentsController.getDepartmentById
);

// 创建部门
router.post(
  '/',
  validate(createDepartmentSchema),
  adminDepartmentsController.createDepartment
);

// 更新部门
router.put(
  '/:id',
  validate(updateDepartmentSchema),
  adminDepartmentsController.updateDepartment
);

// 删除部门
router.delete(
  '/:id',
  validate(departmentIdParamSchema),
  adminDepartmentsController.deleteDepartment
);

// 获取部门统计信息
router.get(
  '/:id/stats',
  validate(departmentStatsSchema),
  adminDepartmentsController.getDepartmentStats
);

// ================================
// 部门服务管理路由
// ================================

// 获取部门服务列表
router.get(
  '/:id/services',
  validate(departmentServicesSchema),
  adminDepartmentsController.getDepartmentServices
);

// 创建部门服务
router.post(
  '/:departmentId/services',
  validate(createServiceSchema),
  adminDepartmentsController.createDepartmentService
);

// 更新部门服务
router.put(
  '/:departmentId/services/:serviceId',
  validate(updateServiceSchema),
  adminDepartmentsController.updateDepartmentService
);

// 删除部门服务
router.delete(
  '/:departmentId/services/:serviceId',
  validate(deleteServiceSchema),
  adminDepartmentsController.deleteDepartmentService
);

// ================================
// 部门医生管理路由
// ================================

// 获取部门下的所有医生
router.get(
  '/:id/doctors',
  validate(departmentIdParamSchema),
  adminDepartmentsController.getDepartmentDoctors
);

// 分配医生到部门
router.post(
  '/:departmentId/doctors',
  adminDepartmentsController.assignDoctorToDepartment
);

// 将医生从部门移除
router.delete(
  '/:departmentId/doctors/:doctorId',
  adminDepartmentsController.removeDoctorFromDepartment
);

export default router; 