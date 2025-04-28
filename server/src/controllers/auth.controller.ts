import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { Prisma, PrismaClient } from '@prisma/client';

type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true }
}>;

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        doctorInfo,
        patientInfo,
      } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ApiError(409, 'User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Start transaction
      const result = await prisma.$transaction(async (tx: PrismaClient) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phone,
            role: {
              connect: {
                name: role,
              },
            },
          },
          include: {
            role: true,
          },
        });

        // Create role-specific profile
        if (role === 'doctor' && doctorInfo) {
          await tx.doctor.create({
            data: {
              id: user.id,
              departmentId: doctorInfo.departmentId,
              specializations: doctorInfo.specializations,
              qualifications: doctorInfo.qualifications,
              experienceYears: doctorInfo.experienceYears,
              consultationFee: doctorInfo.consultationFee,
            },
          });
        } else if (role === 'patient' && patientInfo) {
          await tx.patient.create({
            data: {
              id: user.id,
              dateOfBirth: new Date(patientInfo.dateOfBirth),
              bloodGroup: patientInfo.bloodGroup,
              height: patientInfo.height,
              weight: patientInfo.weight,
            },
          });
        }

        return user;
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(result);
      const refreshToken = this.generateRefreshToken(result);

      // Send verification email
      await this.sendVerificationEmail(result.email);

      res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new ApiError(401, 'Account is not active');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(401, 'Refresh token is required');
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as jwt.JwtPayload;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(401, 'Invalid refresh token'));
      } else {
        next(error);
      }
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    // In a real application, you might want to invalidate the refresh token
    res.json({ message: 'Logged out successfully' });
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists
        return res.json({
          message: 'If an account exists, a password reset email will be sent',
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id },
        config.jwt.secret,
        { expiresIn: '1h' } as SignOptions
      );

      // Send reset email
      await sendEmail({
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${config.frontendUrl}/reset-password?token=${resetToken}`,
      });

      res.json({
        message: 'If an account exists, a password reset email will be sent',
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password
      await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash: hashedPassword },
      });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(401, 'Invalid or expired token'));
      } else {
        next(error);
      }
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;

      // Update user status
      await prisma.user.update({
        where: { id: decoded.id },
        data: { status: 'active' },
      });

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(401, 'Invalid or expired token'));
      } else {
        next(error);
      }
    }
  }

  // Helper methods
  private generateAccessToken(user: UserWithRole): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );
  }

  private generateRefreshToken(user: UserWithRole): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
    );
  }

  private async sendVerificationEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) return;

      const verificationToken = jwt.sign(
        { id: user.id },
        config.jwt.secret,
        { expiresIn: '24h' } as SignOptions
      );

      await sendEmail({
        to: email,
        subject: 'Verify Your Email',
        text: `Click the following link to verify your email: ${config.frontendUrl}/verify-email?token=${verificationToken}`,
      });
    } catch (error) {
      logger.error('Error sending verification email:', error);
    }
  }
} 