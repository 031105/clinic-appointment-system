import { Router } from 'express';
import adminDashboardController from '../controllers/admin-dashboard.controller';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// Add authentication and admin role check for all routes
router.use(authenticate);
router.use(checkRole(['admin']));

// Get dashboard statistics
router.get('/stats', adminDashboardController.getDashboardStats);

// Get admin notifications
router.get('/notifications', adminDashboardController.getNotifications);

// Send notification to users
router.post('/notifications/send', adminDashboardController.sendNotification);

// Mark notification as read
router.patch('/notifications/:id/read', adminDashboardController.markNotificationRead);

// Generate reports
router.post('/reports/generate', adminDashboardController.generateReport);

export default router; 