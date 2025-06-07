import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import dbClient from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export interface AdminProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  roleName: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
}

/**
 * 获取管理员个人资料
 */
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    logger.info(`Fetching profile for admin ID: ${adminId}`);

    const query = `
      SELECT 
        u.user_id as id,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone,
        u.profile_image_blob as "profilePicture",
        u.status,
        u.created_at as "createdAt",
        u.last_login_at as "lastLoginAt",
        r.role_name as "roleName"
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1 AND r.role_name = 'admin'
    `;

    const result = await dbClient.query(query, [adminId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const profile = result.rows[0];

    // 如果profilePicture是Buffer，转换为base64字符串
    if (profile.profilePicture && Buffer.isBuffer(profile.profilePicture)) {
      profile.profilePicture = `data:image/jpeg;base64,${profile.profilePicture.toString('base64')}`;
    }

    return res.status(200).json(profile);
  } catch (error) {
    logger.error('Error in getAdminProfile:', error);
    return res.status(500).json({ message: 'Failed to retrieve admin profile' });
  }
};

/**
 * 更新管理员个人资料
 */
export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    const {
      firstName,
      lastName,
      phone,
      profilePicture
    } = req.body as AdminProfileUpdateRequest;

    logger.info(`Updating profile for admin ID: ${adminId}`);
    logger.debug('Profile update data:', {
      firstName,
      lastName,
      phone,
      hasProfilePicture: !!profilePicture
    });

    const client = await dbClient.getClient();
    try {
      await client.query('BEGIN');

      // 更新users表
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

      if (setClauses.length > 0) {
        queryParams.push(adminId);
        const userUpdateQuery = `
          UPDATE users
          SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $${paramIndex}
          RETURNING user_id
        `;

        const userResult = await client.query(userUpdateQuery, queryParams);
        if (userResult.rows.length === 0) {
          throw new Error('Admin user not found');
        }
      }

      await client.query('COMMIT');

      // 返回更新后的完整资料
      const updatedProfileQuery = `
        SELECT 
          u.user_id as id,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.email,
          u.phone,
          u.profile_image_blob as "profilePicture",
          u.status,
          u.created_at as "createdAt",
          u.last_login_at as "lastLoginAt",
          r.role_name as "roleName"
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1 AND r.role_name = 'admin'
      `;
      
      const updatedProfile = await client.query(updatedProfileQuery, [adminId]);
      const profile = updatedProfile.rows[0];
      
      // 如果profilePicture是Buffer，转换为base64字符串
      if (profile.profilePicture && Buffer.isBuffer(profile.profilePicture)) {
        profile.profilePicture = `data:image/jpeg;base64,${profile.profilePicture.toString('base64')}`;
      }

      return res.status(200).json(profile);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error in updateAdminProfile:', error);
    return res.status(500).json({ message: 'Failed to update admin profile' });
  }
};

/**
 * 上传管理员头像
 */
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    logger.info(`Uploading profile picture for admin ID: ${adminId}`);

    const query = `
      UPDATE users 
      SET profile_image_blob = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING user_id
    `;

    const result = await dbClient.query(query, [req.file.buffer, adminId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // 返回base64编码的图片
    const profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    return res.status(200).json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture 
    });
  } catch (error) {
    logger.error('Error in uploadProfilePicture:', error);
    return res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

/**
 * 修改管理员密码
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    logger.info(`Changing password for admin ID: ${adminId}`);

    // 获取当前密码哈希
    const currentPasswordQuery = `
      SELECT password_hash FROM users WHERE user_id = $1
    `;
    const currentPasswordResult = await dbClient.query(currentPasswordQuery, [adminId]);
    
    if (currentPasswordResult.rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const currentPasswordHash = currentPasswordResult.rows[0].password_hash;

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // 加密新密码
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    const updatePasswordQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING user_id
    `;

    const result = await dbClient.query(updatePasswordQuery, [newPasswordHash, adminId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Failed to update password' });
    }

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Error in changePassword:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
}; 