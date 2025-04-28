import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  createUserSchema,
  updateUserStatusSchema,
  resetPasswordSchema,
} from '../schemas/admin.schema';

const router = Router();
const adminController = new AdminController();

// User Management
router.get(
  '/users',
  authorize('admin'),
  adminController.getAllUsers
);

router.get(
  '/users/:id',
  authorize('admin'),
  adminController.getUserById
);

router.post(
  '/users',
  authorize('admin'),
  validateRequest(createUserSchema),
  adminController.createUser
);

router.patch(
  '/users/:id/status',
  authorize('admin'),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus
);

router.post(
  '/users/:id/reset-password',
  authorize('admin'),
  validateRequest(resetPasswordSchema),
  adminController.resetUserPassword
);

// System Statistics
router.get(
  '/stats',
  authorize('admin'),
  adminController.getSystemStats
);

// Audit Logs
router.get(
  '/audit-logs',
  authorize('admin'),
  adminController.getAuditLogs
);

export default router; 