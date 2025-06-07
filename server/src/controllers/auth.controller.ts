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
  // Initial registration (step 1) - sends OTP
  async initiateRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !firstName || !lastName) {
        throw new ApiError(400, 'Email, first name, and last name are required');
      }

      // Validate field values (trim whitespace and check length)
      const trimmedEmail = email.trim();
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();

      if (!trimmedEmail || !trimmedFirstName || !trimmedLastName) {
        throw new ApiError(400, 'Email, first name, and last name cannot be empty');
      }

      if (trimmedFirstName.length < 2) {
        throw new ApiError(400, 'First name must be at least 2 characters long');
      }

      // Check if user already exists
      const existingUserQuery = `SELECT * FROM users WHERE email = $1`;
      const existingUserResult = await dbClient.query(existingUserQuery, [trimmedEmail]);
      
      if (existingUserResult.rows.length > 0) {
        throw new ApiError(409, 'User already exists');
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this email and type first
      await dbClient.query(
        'DELETE FROM email_verifications WHERE email = $1 AND type = $2',
        [trimmedEmail, 'registration']
      );

      // Store new OTP in database
      const storeOTPQuery = `
        INSERT INTO email_verifications (email, otp, type, expires_at)
        VALUES ($1, $2, 'registration', $3)
      `;
      
      await dbClient.query(storeOTPQuery, [trimmedEmail, otp, expiresAt]);

      // For now, return OTP in response (in production, this would be sent via EmailJS from frontend)
      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email',
        // TODO: Remove this in production - OTP should only be sent via email
        otp: config.nodeEnv === 'development' ? otp : undefined,
        email: trimmedEmail
      });

    } catch (error) {
      next(error);
    }
  }

  // Complete registration (step 2) - verify OTP and create user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        otp,
        password,
        firstName,
        lastName,
        phone,
        role,
        doctorInfo,
        patientInfo,
      } = req.body;

      // Verify OTP
      const verifyResult = await this.verifyOTP(email, otp, 'registration');
      if (!verifyResult.valid) {
        throw new ApiError(400, verifyResult.message);
      }

      // Check if user already exists (double check)
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
            email, password_hash, first_name, last_name, phone, role_id, status, email_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING user_id, email
        `;
        
        const userResult = await client.query(createUserQuery, [
          email, 
          hashedPassword, 
          firstName, 
          lastName, 
          phone, 
          roleId,
          'active',
          true // Email is verified through OTP
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

        // Mark OTP as verified
        await client.query(
          'UPDATE email_verifications SET verified = true WHERE email = $1 AND type = $2',
          [email, 'registration']
        );
        
        await client.query('COMMIT');
        
        // 创建简单的token - 格式为 user_id:email:role
        const token = `${userId}:${email}:${role}`;

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            id: userId,
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: role
          }
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
          u.must_change_password,
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

      // Check if user must change password (temporary password scenario)
      if (user.must_change_password) {
        return res.json({
          success: true,
          message: 'Login successful - password change required',
          mustChangePassword: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role_name
          }
        });
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
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role_name,
          name: `${user.firstName} ${user.lastName}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP
  async verifyOTPEndpoint(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, type } = req.body;

      const result = await this.verifyOTP(email, otp, type);
      
      if (result.valid) {
        res.json({
          success: true,
          message: 'OTP verified successfully'
        });
      } else {
        throw new ApiError(400, result.message);
      }
    } catch (error) {
      next(error);
    }
  }

  // Resend OTP
  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type } = req.body;

      // Check rate limiting - only allow resend after 1 minute
      const lastOTPQuery = `
        SELECT created_at FROM email_verifications 
        WHERE email = $1 AND type = $2 
        ORDER BY created_at DESC LIMIT 1
      `;
      
      const lastOTPResult = await dbClient.query(lastOTPQuery, [email, type]);
      
      if (lastOTPResult.rows.length > 0) {
        const lastCreated = new Date(lastOTPResult.rows[0].created_at);
        const now = new Date();
        const timeDiff = (now.getTime() - lastCreated.getTime()) / 1000; // in seconds
        
        if (timeDiff < 60) {
          throw new ApiError(429, `Please wait ${60 - Math.floor(timeDiff)} seconds before requesting a new code`);
        }
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update OTP in database
      const updateOTPQuery = `
        UPDATE email_verifications 
        SET otp = $1, expires_at = $2, verified = false, attempts = 0, updated_at = NOW()
        WHERE email = $3 AND type = $4
      `;
      
      const result = await dbClient.query(updateOTPQuery, [otp, expiresAt, email, type]);
      
      if (result.rowCount === 0) {
        // Insert new OTP if no existing record
        await dbClient.query(
          'INSERT INTO email_verifications (email, otp, type, expires_at) VALUES ($1, $2, $3, $4)',
          [email, otp, type, expiresAt]
        );
      }

      res.json({
        success: true,
        message: 'New verification code sent to your email',
        // TODO: Remove this in production
        otp: config.nodeEnv === 'development' ? otp : undefined
      });

    } catch (error) {
      next(error);
    }
  }

  // Forgot password with temporary password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Find user
      const userQuery = `SELECT user_id, email, first_name, last_name FROM users WHERE email = $1`;
      const userResult = await dbClient.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        // Don't reveal that the email doesn't exist
        return res.json({
          success: true,
          message: 'If an account exists with that email, a temporary password has been sent.',
        });
      }
      
      const user = userResult.rows[0];

      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      
      // Hash temporary password
      const salt = await bcrypt.genSalt(10);
      const hashedTempPassword = await bcrypt.hash(tempPassword, salt);

      // Update user with temporary password
      const updatePasswordQuery = `
        UPDATE users
        SET password_hash = $1, must_change_password = true
        WHERE user_id = $2
      `;
      
      await dbClient.query(updatePasswordQuery, [hashedTempPassword, user.user_id]);

      // For now, return temp password in response (in production, this would be sent via EmailJS from frontend)
      res.json({
        success: true,
        message: 'Temporary password sent to your email',
        // TODO: Remove this in production - temp password should only be sent via email
        tempPassword: config.nodeEnv === 'development' ? tempPassword : undefined,
        email: email,
        userName: `${user.first_name} ${user.last_name}`
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password with temporary password
  async resetPasswordWithTemp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, tempPassword, newPassword } = req.body;

      // Find user
      const userQuery = `
        SELECT user_id, password_hash, must_change_password 
        FROM users 
        WHERE email = $1
      `;
      const userResult = await dbClient.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw new ApiError(400, 'Invalid credentials');
      }
      
      const user = userResult.rows[0];

      // Verify temporary password
      const isValidTempPassword = await bcrypt.compare(tempPassword, user.password_hash);
      if (!isValidTempPassword) {
        throw new ApiError(400, 'Invalid temporary password');
      }

      // Check if user must change password
      if (!user.must_change_password) {
        throw new ApiError(400, 'Password change not required');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear must_change_password flag
      const updatePasswordQuery = `
        UPDATE users
        SET password_hash = $1, must_change_password = false
        WHERE user_id = $2
      `;
      
      await dbClient.query(updatePasswordQuery, [hashedNewPassword, user.user_id]);

      res.json({
        success: true,
        message: 'Password reset successful',
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

  // Private helper methods
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

  private generateRefreshToken(user: UserWithRole): string {
    const payload = {
      id: user.id,
    };

    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.refreshExpiresIn) || 604800,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

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

  // Helper method to verify OTP
  private async verifyOTP(email: string, otp: string, type: string): Promise<{valid: boolean, message: string}> {
    // Find OTP record
    const otpQuery = `
      SELECT * FROM email_verifications 
      WHERE email = $1 AND type = $2 AND verified = false
      ORDER BY created_at DESC LIMIT 1
    `;
    
    const otpResult = await dbClient.query(otpQuery, [email, type]);
    
    if (otpResult.rows.length === 0) {
      return { valid: false, message: 'No verification code found. Please request a new one.' };
    }
    
    const otpRecord = otpResult.rows[0];
    
    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return { valid: false, message: 'Verification code has expired. Please request a new one.' };
    }
    
    // Check attempts limit
    if (otpRecord.attempts >= 3) {
      return { valid: false, message: 'Too many failed attempts. Please request a new verification code.' };
    }
    
    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await dbClient.query(
        'UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1',
        [otpRecord.id]
      );
      
      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      return { valid: false, message: `Invalid verification code. ${remainingAttempts} attempts remaining.` };
    }
    
    return { valid: true, message: 'OTP verified successfully' };
  }

  // Helper method to generate OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Helper method to generate temporary password
  private generateTempPassword(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill remaining characters
    for (let i = password.length; i < 12; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
} 