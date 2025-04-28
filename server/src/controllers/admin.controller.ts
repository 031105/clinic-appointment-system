import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email';

export class AdminController {
  // User Management
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, role, status, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      // Filter by role
      if (role) {
        where.role = {
          name: role as string,
        };
      }

      // Filter by status
      if (status) {
        where.status = status as string;
      }

      // Search by name or email
      if (search) {
        where.OR = [
          {
            firstName: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        ];
      }

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            role: true,
            doctor: {
              include: {
                department: true,
              },
            },
            patient: true,
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.user.count({
          where,
        }),
      ]);

      res.json({
        status: 'success',
        data: {
          users,
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

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        roleName,
        departmentId,
        // Doctor specific fields
        specializations,
        qualifications,
        experienceYears,
        consultationFee,
        // Patient specific fields
        dateOfBirth,
        bloodGroup,
      } = req.body;

      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ApiError(409, 'Email is already in use');
      }

      // Get role
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        throw new ApiError(404, 'Role not found');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            address,
            roleId: role.id,
            status: 'active',
          },
        });

        // Create role-specific profile
        if (roleName === 'doctor') {
          // Validate department
          if (!departmentId) {
            throw new ApiError(400, 'Department ID is required for doctors');
          }

          const department = await tx.department.findUnique({
            where: { id: parseInt(departmentId) },
          });

          if (!department) {
            throw new ApiError(404, 'Department not found');
          }

          await tx.doctor.create({
            data: {
              id: newUser.id,
              departmentId: parseInt(departmentId),
              specializations: specializations || [],
              qualifications: qualifications || {},
              experienceYears: experienceYears ? parseInt(experienceYears) : null,
              consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
              availableOnline: false,
              averageRating: null,
              reviewCount: 0,
            },
          });
        } else if (roleName === 'patient') {
          // Validate date of birth
          if (!dateOfBirth) {
            throw new ApiError(400, 'Date of birth is required for patients');
          }

          await tx.patient.create({
            data: {
              id: newUser.id,
              dateOfBirth: new Date(dateOfBirth),
              bloodGroup,
              height: null,
              weight: null,
              medicalHistory: {},
              insuranceInfo: {},
            },
          });
        } else if (roleName === 'admin') {
          await tx.admin.create({
            data: {
              id: newUser.id,
              adminType: 'system',
              permissions: {},
            },
          });
        }

        return newUser;
      });

      // Send welcome email
      await sendEmail({
        to: email,
        subject: 'Welcome to the Clinic Management System',
        text: `Hello ${firstName},\n\nYour account has been created. You can log in with your email and the provided password.\n\nRegards,\nAdmin Team`,
      });

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { status } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'UPDATE_USER_STATUS',
          tableName: 'users',
          recordId: userId,
          oldData: { status: user.status },
          newData: { status },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
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

  async resetUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { newPassword } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update user password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'RESET_USER_PASSWORD',
          tableName: 'users',
          recordId: userId,
          newData: { passwordReset: true },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      // Send email notification
      await sendEmail({
        to: user.email,
        subject: 'Your Password Has Been Reset',
        text: `Hello ${user.firstName},\n\nYour password has been reset by an administrator. You can now log in with your new password.\n\nRegards,\nAdmin Team`,
      });

      res.json({
        status: 'success',
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // System Settings
  async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        recentUsers,
        recentAppointments,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.doctor.count(),
        prisma.patient.count(),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: 'scheduled' } }),
        prisma.appointment.count({ where: { status: 'completed' } }),
        prisma.appointment.count({ where: { status: 'cancelled' } }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { role: true },
        }),
        prisma.appointment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            patient: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      res.json({
        status: 'success',
        data: {
          totalUsers,
          totalDoctors,
          totalPatients,
          appointments: {
            total: totalAppointments,
            pending: pendingAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
          },
          recentUsers,
          recentAppointments,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Audit Logs
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, action, userId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      if (action) {
        where.action = action;
      }

      if (userId) {
        where.userId = parseInt(userId as string);
      }

      const [logs, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.auditLog.count({
          where,
        }),
      ]);

      res.json({
        status: 'success',
        data: {
          logs,
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
} 