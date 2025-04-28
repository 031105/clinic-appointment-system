import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class NotificationController {
  // Get all notifications for the current user
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { page = 1, limit = 20, isRead } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { userId };
      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.notification.count({
          where,
        }),
      ]);

      res.json({
        status: 'success',
        data: {
          notifications,
          pagination: {
            total: totalCount,
            page: Number(page),
            pageSize: Number(limit),
            totalPages: Math.ceil(totalCount / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread notification count
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      res.json({
        status: 'success',
        data: {
          unreadCount: count,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark a notification as read
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const notificationId = parseInt(id);

      // Check if notification exists and belongs to the user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new ApiError(404, 'Notification not found');
      }

      // Update the notification
      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({
        status: 'success',
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a notification
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const notificationId = parseInt(id);

      // Check if notification exists and belongs to the user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new ApiError(404, 'Notification not found');
      }

      // Delete the notification
      await prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });

      res.json({
        status: 'success',
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user notification preferences
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const preferences = await prisma.notificationPreference.findUnique({
        where: {
          userId,
        },
      });

      if (!preferences) {
        // Create default preferences if they don't exist
        const defaultPreferences = await prisma.notificationPreference.create({
          data: {
            userId,
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            reminderTiming: 24,
            preferences: {},
          },
        });

        return res.json({
          status: 'success',
          data: defaultPreferences,
        });
      }

      res.json({
        status: 'success',
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user notification preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const {
        emailEnabled,
        smsEnabled,
        pushEnabled,
        reminderTiming,
        preferences,
      } = req.body;

      // Check if preferences exist
      const existingPreferences = await prisma.notificationPreference.findUnique({
        where: {
          userId,
        },
      });

      let updatedPreferences;
      if (existingPreferences) {
        // Update existing preferences
        updatedPreferences = await prisma.notificationPreference.update({
          where: {
            userId,
          },
          data: {
            emailEnabled,
            smsEnabled,
            pushEnabled,
            reminderTiming,
            preferences: preferences || undefined,
          },
        });
      } else {
        // Create new preferences
        updatedPreferences = await prisma.notificationPreference.create({
          data: {
            userId,
            emailEnabled: emailEnabled ?? true,
            smsEnabled: smsEnabled ?? true,
            pushEnabled: pushEnabled ?? true,
            reminderTiming: reminderTiming ?? 24,
            preferences: preferences || {},
          },
        });
      }

      res.json({
        status: 'success',
        data: updatedPreferences,
      });
    } catch (error) {
      next(error);
    }
  }

  // Send a test notification (development/testing purposes)
  async sendTestNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { title, message, type = 'system' } = req.body;

      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data: {},
          isRead: false,
        },
      });

      res.status(201).json({
        status: 'success',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
} 