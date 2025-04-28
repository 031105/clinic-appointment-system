import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class UserController {
  // Get current user profile
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          doctor: {
            include: {
              department: true,
            },
          },
          patient: true,
          preferences: true,
        },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const {
        firstName,
        lastName,
        phone,
        address,
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          address,
        },
        include: {
          role: true,
        },
      });

      res.json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      res.json({
        status: 'success',
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get notification preferences
  async getNotificationPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      res.json({
        status: 'success',
        data: preferences || {},
      });
    } catch (error) {
      next(error);
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(req: Request, res: Response, next: NextFunction) {
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

      const updatedPreferences = await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          emailEnabled,
          smsEnabled,
          pushEnabled,
          reminderTiming,
          preferences,
        },
        update: {
          emailEnabled,
          smsEnabled,
          pushEnabled,
          reminderTiming,
          preferences,
        },
      });

      res.json({
        status: 'success',
        data: updatedPreferences,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin only: Get all users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        include: {
          role: true,
          doctor: {
            include: {
              department: true,
            },
          },
          patient: true,
        },
      });

      res.json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin only: Get user by ID
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          doctor: {
            include: {
              department: true,
            },
          },
          patient: true,
          preferences: true,
        },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin only: Update user
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        status,
        roleId,
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          email,
          phone,
          address,
          status,
          roleId,
        },
        include: {
          role: true,
        },
      });

      res.json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin only: Delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      await prisma.user.delete({
        where: { id: userId },
      });

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
} 