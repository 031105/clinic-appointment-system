import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from '../schemas/department.schema';

const router = Router();
const departmentController = new DepartmentController();

// Get all departments
router.get(
  '/',
  departmentController.getAllDepartments
);

// Get department by ID
router.get(
  '/:id',
  departmentController.getDepartmentById
);

// Create new department (admin only)
router.post(
  '/',
  authorize('admin'),
  validateRequest(createDepartmentSchema),
  departmentController.createDepartment
);

// Update department (admin only)
router.patch(
  '/:id',
  authorize('admin'),
  validateRequest(updateDepartmentSchema),
  departmentController.updateDepartment
);

// Delete department (admin only)
router.delete(
  '/:id',
  authorize('admin'),
  departmentController.deleteDepartment
);

export default router; 