import { Router } from 'express';
import { AdminUsersController } from '../controllers/admin-users.controller';
import { validate } from '../middleware/validate';
import { 
  createUserSchema, 
  updateUserStatusSchema, 
  userIdSchema 
} from '../schemas/admin-users.schema';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();
const adminUsersController = new AdminUsersController();

// 所有路由都需要认证和管理员权限
router.use(authenticate);
router.use(checkRole(['admin']));

// 获取管理员用户列表
router.get('/admin-users', adminUsersController.getAdminUsers.bind(adminUsersController));

// 获取医生用户列表
router.get('/doctor-users', adminUsersController.getDoctorUsers.bind(adminUsersController));

// 获取用户详情
router.get('/:id', 
  validate(userIdSchema),
  adminUsersController.getUserById.bind(adminUsersController)
);

// 创建新用户
router.post('/', 
  validate(createUserSchema),
  adminUsersController.createUser.bind(adminUsersController)
);

// 更新用户状态
router.patch('/:id/status', 
  validate(userIdSchema),
  validate(updateUserStatusSchema),
  adminUsersController.updateUserStatus.bind(adminUsersController)
);

export default router; 