import { Request, Response } from 'express';
import dbClient from '../utils/db-client';
import { logger } from '../utils/logger';

// 扩展Request类型，包含用户信息
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  }
}

interface DoctorProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialty?: string;
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
  profilePicture?: string;
}

/**
 * 获取医生个人资料
 */
export const getDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    logger.info(`Fetching profile for doctor ID: ${doctorId}`);

    const query = `
      SELECT 
        d.doctor_id as id,
        d.specialty,
        d.qualification as qualifications,
        d.experience as experienceYears,
        d.consultation_fee as consultationFee,
        d.bio,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone,
        u.profile_image_blob as "profilePicture",
        dep.name as "departmentName",
        dep.department_id as "departmentId"
      FROM doctors d
      JOIN users u ON d.doctor_id = u.user_id
      JOIN departments dep ON d.department_id = dep.department_id
      WHERE d.doctor_id = $1
    `;

    const result = await dbClient.query(query, [doctorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const profile = result.rows[0];
    
    // 将qualifications从字符串转换为数组
    if (profile.qualifications) {
      profile.qualifications = profile.qualifications.split(',').map((q: string) => q.trim());
    } else {
      profile.qualifications = [];
    }

    // 如果profilePicture是Buffer，转换为base64字符串
    if (profile.profilePicture && Buffer.isBuffer(profile.profilePicture)) {
      // 假设图片是JPEG格式，如果需要可以添加MIME类型检测
      profile.profilePicture = `data:image/jpeg;base64,${profile.profilePicture.toString('base64')}`;
    }

    return res.status(200).json(profile);
  } catch (error) {
    logger.error('Error in getDoctorProfile:', error);
    return res.status(500).json({ message: 'Failed to retrieve doctor profile' });
  }
};

/**
 * 更新医生个人资料
 */
export const updateDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const {
      firstName,
      lastName,
      phone,
      specialty,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      profilePicture
    } = req.body as DoctorProfileUpdateRequest;

    logger.info(`Updating profile for doctor ID: ${doctorId}`);
    logger.debug('Profile update data:', {
      firstName,
      lastName,
      phone,
      specialty,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      hasProfilePicture: !!profilePicture
    });

    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      // 更新users表
      if (firstName || lastName || phone || profilePicture) {
        const setClauses = [];
        const queryParams = [];
        let paramIndex = 1;

        if (firstName) {
          setClauses.push(`first_name = $${paramIndex}`);
          queryParams.push(firstName);
          paramIndex++;
        }
        if (lastName) {
          setClauses.push(`last_name = $${paramIndex}`);
          queryParams.push(lastName);
          paramIndex++;
        }
        if (phone) {
          setClauses.push(`phone = $${paramIndex}`);
          queryParams.push(phone);
          paramIndex++;
        }
        if (profilePicture) {
          setClauses.push(`profile_image_blob = $${paramIndex}`);
          queryParams.push(profilePicture);
          paramIndex++;
        }

        queryParams.push(doctorId);
        const userUpdateQuery = `
          UPDATE users
          SET ${setClauses.join(', ')}
          WHERE user_id = $${paramIndex}
          RETURNING user_id
        `;

        const userResult = await client.query(userUpdateQuery, queryParams);
        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }
      }

      // 更新doctors表
      if (specialty || qualifications || experienceYears !== undefined || consultationFee !== undefined || bio) {
        const setClauses = [];
        const queryParams = [];
        let paramIndex = 1;

        if (specialty) {
          setClauses.push(`specialty = $${paramIndex}`);
          queryParams.push(specialty);
          paramIndex++;
        }
        if (qualifications) {
          setClauses.push(`qualification = $${paramIndex}`);
          queryParams.push(qualifications.join(','));
          paramIndex++;
        }
        if (experienceYears !== undefined) {
          setClauses.push(`experience = $${paramIndex}`);
          queryParams.push(experienceYears);
          paramIndex++;
        }
        if (consultationFee !== undefined) {
          setClauses.push(`consultation_fee = $${paramIndex}`);
          queryParams.push(consultationFee);
          paramIndex++;
        }
        if (bio) {
          setClauses.push(`bio = $${paramIndex}`);
          queryParams.push(bio);
          paramIndex++;
        }

        queryParams.push(doctorId);
        const doctorUpdateQuery = `
          UPDATE doctors
          SET ${setClauses.join(', ')}
          WHERE doctor_id = $${paramIndex}
          RETURNING doctor_id
        `;

        const doctorResult = await client.query(doctorUpdateQuery, queryParams);
        if (doctorResult.rows.length === 0) {
          throw new Error('Doctor not found');
        }
      }

      await client.query('COMMIT');

      // 返回更新后的完整资料
      const updatedProfileQuery = `
        SELECT 
          d.doctor_id as id,
          d.specialty,
          d.qualification as qualifications,
          d.experience as experienceYears,
          d.consultation_fee as consultationFee,
          d.bio,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.email,
          u.phone,
          u.profile_image_blob as "profilePicture",
          dep.name as "departmentName",
          dep.department_id as "departmentId"
        FROM doctors d
        JOIN users u ON d.doctor_id = u.user_id
        JOIN departments dep ON d.department_id = dep.department_id
        WHERE d.doctor_id = $1
      `;
      
      const updatedProfile = await client.query(updatedProfileQuery, [doctorId]);
      const profile = updatedProfile.rows[0];
      
      // 将qualifications从字符串转换为数组
      if (profile.qualifications) {
        profile.qualifications = profile.qualifications.split(',').map((q: string) => q.trim());
      } else {
        profile.qualifications = [];
      }

      return res.status(200).json(profile);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error in updateDoctorProfile:', error);
    return res.status(500).json({ message: 'Failed to update doctor profile' });
  }
};

/**
 * 上传头像
 */
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user!.id;
    const profilePicture = req.file?.buffer;

    if (!profilePicture) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64 string
    const base64Image = `data:${req.file?.mimetype};base64,${profilePicture.toString('base64')}`;

    const query = `
      UPDATE users
      SET profile_image_blob = $1
      WHERE user_id = $2
      RETURNING profile_image_blob as "profilePicture"
    `;

    const result = await dbClient.query(query, [base64Image, doctorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ profilePicture: base64Image });
  } catch (error) {
    logger.error('Error in uploadProfilePicture:', error);
    return res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

/**
 * 更改密码
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Log attempt (without showing the actual passwords)
    logger.info(`Password change attempt for doctor ID: ${userId}`);
    
    // Validate input
    if (!currentPassword || !newPassword) {
      logger.warn('Missing required password fields');
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }
    
    if (newPassword.length < 8) {
      logger.warn('New password too short');
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Verify current password
    const passwordQuery = `
      SELECT password_hash FROM users WHERE user_id = $1
    `;
    const passwordResult = await dbClient.query(passwordQuery, [userId]);

    if (passwordResult.rows.length === 0) {
      logger.warn(`User ID ${userId} not found when changing password`);
      return res.status(404).json({ message: 'User not found' });
    }

    const currentPasswordHash = passwordResult.rows[0].password_hash;
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);

    if (!isPasswordValid) {
      logger.warn(`Invalid current password for user ID ${userId}`);
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING user_id
    `;
    
    const updateResult = await dbClient.query(updateQuery, [hashedPassword, userId]);

    if (updateResult.rows.length === 0) {
      logger.error(`Failed to update password for user ID ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Password successfully updated for user ID ${userId}`);
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error in changePassword:', error);
    if (error instanceof Error) {
      logger.error('Error details:', error.message, error.stack);
    }
    return res.status(500).json({ message: 'Failed to change password' });
  }
}; 