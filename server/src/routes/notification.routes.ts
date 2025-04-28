import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  updatePreferencesSchema,
  sendTestNotificationSchema,
} from '../schemas/notification.schema';

const router = Router();
const notificationController = new NotificationController();

// Get all notifications for the current user
router.get(
  '/',
  notificationController.getNotifications
);

// Get unread notification count
router.get(
  '/unread-count',
  notificationController.getUnreadCount
);

// Mark a notification as read
router.patch(
  '/:id/read',
  notificationController.markAsRead
);

// Mark all notifications as read
router.patch(
  '/mark-all-read',
  notificationController.markAllAsRead
);

// Delete a notification
router.delete(
  '/:id',
  notificationController.deleteNotification
);

// Get notification preferences
router.get(
  '/preferences',
  notificationController.getPreferences
);

// Update notification preferences
router.patch(
  '/preferences',
  validateRequest(updatePreferencesSchema),
  notificationController.updatePreferences
);

// Send a test notification (for testing only, could be restricted to dev environment)
router.post(
  '/test',
  authorize('admin'),
  validateRequest(sendTestNotificationSchema),
  notificationController.sendTestNotification
);

export default router; 