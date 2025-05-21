import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../middleware/errorHandler';
import dbClient from '../config/database';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';

// 用户类型定义
interface UserWithRole {
  id: number;
  email: string;
  role_name: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
}

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
      const existingUserQuery = `SELECT * FROM users WHERE email = $1`;
      const existingUserResult = await dbClient.query(existingUserQuery, [email]);
      
      if (existingUserResult.rows.length > 0) {
        throw new ApiError(409, 'User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Start transaction
      const client = await dbClient.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Get role ID
        const roleQuery = `SELECT role_id FROM roles WHERE role_name = $1`;
        const roleResult = await client.query(roleQuery, [role]);
        
        if (roleResult.rows.length === 0) {
          throw new ApiError(400, `Role '${role}' not found`);
        }
        
        const roleId = roleResult.rows[0].role_id;
        
        // Create user
        const createUserQuery = `
          INSERT INTO users (
            email, password_hash, first_name, last_name, phone, role_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING user_id, email
        `;
        
        const userResult = await client.query(createUserQuery, [
          email, 
          hashedPassword, 
          firstName, 
          lastName, 
          phone, 
          roleId,
          'active'
        ]);
        
        const user = userResult.rows[0];
        const userId = user.user_id;
        
        // Create role-specific profile
        if (role === 'doctor' && doctorInfo) {
          const createDoctorQuery = `
            INSERT INTO doctors (
              doctor_id, department_id, specializations, qualifications, 
              experience_years, consultation_fee
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;
          
          await client.query(createDoctorQuery, [
            userId,
            doctorInfo.departmentId,
            JSON.stringify(doctorInfo.specializations),
            JSON.stringify(doctorInfo.qualifications),
            doctorInfo.experienceYears,
            doctorInfo.consultationFee
          ]);
          
        } else if (role === 'patient' && patientInfo) {
          const createPatientQuery = `
            INSERT INTO patients (
              patient_id, date_of_birth, blood_type, height, weight, medical_history
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;
          
          await client.query(createPatientQuery, [
            userId,
            new Date(patientInfo.dateOfBirth),
            patientInfo.bloodGroup,
            patientInfo.height,
            patientInfo.weight,
            JSON.stringify({})
          ]);
        }
        
        await client.query('COMMIT');
        
        // 创建简单的token - 格式为 user_id:email:role
        const token = `${userId}:${email}:${role}`;

        // 发送验证邮件
        await this.sendVerificationEmail(user.email);

        res.status(201).json({
          message: 'User registered successfully',
          token
        });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const userQuery = `
        SELECT 
          u.user_id as id, 
          u.email, 
          u.password_hash as "passwordHash", 
          u.first_name as "firstName", 
          u.last_name as "lastName",
          u.status,
          r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
      `;
      
      const userResult = await dbClient.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw new ApiError(401, 'Invalid credentials');
      }
      
      const user = userResult.rows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new ApiError(401, 'Account is not active');
      }

      // 创建简单的token - 格式为 user_id:email:role
      const token = `${user.id}:${user.email}:${user.role_name}`;

      // Update last login
      const updateLoginQuery = `
        UPDATE users 
        SET last_login_at = NOW() 
        WHERE user_id = $1
      `;
      
      await dbClient.query(updateLoginQuery, [user.id]);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role_name,
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
      const userQuery = `
        SELECT 
          u.user_id as id, 
          u.email,
          r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
      `;
      
      const userResult = await dbClient.query(userQuery, [decoded.id]);
      
      if (userResult.rows.length === 0) {
        throw new ApiError(401, 'Invalid refresh token');
      }
      
      const user = userResult.rows[0];

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

  // Logout - optional, as most JWT implementations are stateless
  async logout(req: Request, res: Response) {
    // For stateless auth, there's nothing to do server-side
    res.json({ message: 'Logged out successfully' });
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Find user
      const userQuery = `SELECT user_id, email FROM users WHERE email = $1`;
      const userResult = await dbClient.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        // Don't reveal that the email doesn't exist
        return res.json({
          message: 'If an account exists with that email, a password reset link has been sent.',
        });
      }
      
      const user = userResult.rows[0];

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.user_id },
        config.jwt.resetSecret,
        { expiresIn: '15m' }
      );

      // Store reset token
      const storeTokenQuery = `
        UPDATE users
        SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '15 minutes'
        WHERE user_id = $2
      `;
      
      await dbClient.query(storeTokenQuery, [resetToken, user.user_id]);

      // Send password reset email
      await this.sendPasswordResetEmail(user.email, resetToken);

      res.json({
        message: 'Password reset email sent',
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new ApiError(400, 'Token and password are required');
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwt.resetSecret) as jwt.JwtPayload;

      // Find user with valid reset token
      const userQuery = `
        SELECT user_id FROM users 
        WHERE user_id = $1 AND reset_token = $2 AND reset_token_expires > NOW()
      `;
      
      const userResult = await dbClient.query(userQuery, [decoded.id, token]);
      
      if (userResult.rows.length === 0) {
        throw new ApiError(400, 'Invalid or expired token');
      }
      
      const userId = userResult.rows[0].user_id;

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password and clear reset token
      const updatePasswordQuery = `
        UPDATE users
        SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
        WHERE user_id = $2
      `;
      
      await dbClient.query(updatePasswordQuery, [hashedPassword, userId]);

      res.json({
        message: 'Password reset successful',
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(400, 'Invalid or expired token'));
      } else {
        next(error);
      }
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      if (!token) {
        throw new ApiError(400, 'Verification token is required');
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        config.jwt.verifyEmailSecret
      ) as jwt.JwtPayload;

      // Update user email verified status
      const updateQuery = `
        UPDATE users
        SET email_verified = true
        WHERE email = $1
      `;
      
      const result = await dbClient.query(updateQuery, [decoded.email]);
      
      if (result.rowCount === 0) {
        throw new ApiError(400, 'Invalid verification token');
      }

      // Redirect to frontend confirmation page
      res.redirect(`${config.frontend.url}/email-verified`);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(400, 'Invalid verification token'));
      } else {
        next(error);
      }
    }
  }

  // Generate access token
  private generateAccessToken(user: UserWithRole): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role_name,
    };

    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.accessExpiresIn) || 3600,
    };

    return jwt.sign(payload, config.jwt.secret, options);
  }

  // Generate refresh token
  private generateRefreshToken(user: UserWithRole): string {
    const payload = {
      id: user.id,
    };

    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.refreshExpiresIn) || 604800,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  // Send verification email
  private async sendVerificationEmail(email: string) {
    try {
      const token = jwt.sign(
        { email },
        config.jwt.verifyEmailSecret,
        { expiresIn: '7d' }
      );

      const verificationUrl = `${config.api.url}/auth/verify-email/${token}`;

      await sendEmail({
        to: email,
        subject: 'Email Verification',
        html: `
          <h1>Email Verification</h1>
          <p>Please click the link below to verify your email:</p>
          <a href="${verificationUrl}">Verify Email</a>
        `,
        text: 'Please click the link to verify your email: ' + verificationUrl
      });
    } catch (error) {
      logger.error('Failed to send verification email', error);
    }
  }

  // Send password reset email
  private async sendPasswordResetEmail(email: string, token: string) {
    try {
      const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;

      await sendEmail({
        to: email,
        subject: 'Password Reset',
        html: `
          <h1>Password Reset</h1>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
        `,
        text: 'Please click the link to reset your password: ' + resetUrl
      });
    } catch (error) {
      logger.error('Failed to send password reset email', error);
    }
  }
} 