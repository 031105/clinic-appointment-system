"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmergencyContact = exports.updateEmergencyContact = exports.addEmergencyContact = exports.getEmergencyContacts = exports.deleteAllergy = exports.updateAllergy = exports.addAllergy = exports.getAllergies = exports.changePassword = exports.updateProfile = exports.getPatientProfile = void 0;
const db_client_1 = __importDefault(require("../utils/db-client"));
const logger_1 = require("../utils/logger");
/**
 * 获取患者个人资料
 */
const getPatientProfile = async (req, res) => {
    try {
        // 使用id作为患者ID
        const patientId = req.user.id;
        logger_1.logger.info(`Fetching profile for patient ID: ${patientId}`);
        // 获取患者基本信息
        const patientResult = await db_client_1.default.query(`
      SELECT 
        p.patient_id as id,
        p.patient_id as "userId",
        p.date_of_birth as "dateOfBirth",
        p.blood_type as "bloodGroup",
        p.height,
        p.weight,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone,
        u.address,
        u.profile_image_blob
      FROM patients p
      JOIN users u ON p.patient_id = u.user_id
      WHERE p.patient_id = $1
    `, [patientId]);
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        const patient = patientResult.rows[0];
        logger_1.logger.info(`Patient data fetched: ${JSON.stringify({
            id: patient.id,
            bloodGroup: patient.bloodGroup,
            height: patient.height,
            weight: patient.weight
        })}`);
        // 如果地址是JSON字符串，尝试解析它
        if (patient.address && typeof patient.address === 'string') {
            try {
                patient.address = JSON.parse(patient.address);
            }
            catch (e) {
                // 如果解析失败，保持原样
                logger_1.logger.warn('Failed to parse address JSON:', e);
            }
        }
        // 获取患者过敏信息
        const allergiesResult = await db_client_1.default.query(`
      SELECT 
        allergy_id as id,
        name as "allergyName",
        severity
      FROM patient_allergies
      WHERE patient_id = $1
    `, [patientId]);
        // 获取紧急联系人
        const contactsResult = await db_client_1.default.query(`
      SELECT 
        contact_id as id,
        name,
        relationship,
        phone,
        is_default as "isPrimary"
      FROM emergency_contacts
      WHERE patient_id = $1
    `, [patientId]);
        // 构建完整的患者资料
        const profile = {
            ...patient,
            user: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phone: patient.phone,
                address: patient.address,
                profile_image_blob: patient.profile_image_blob
            },
            allergies: allergiesResult.rows,
            emergencyContacts: contactsResult.rows
        };
        // 删除冗余字段
        delete profile.firstName;
        delete profile.lastName;
        delete profile.email;
        delete profile.phone;
        delete profile.address;
        delete profile.profile_image_blob;
        return res.status(200).json(profile);
    }
    catch (error) {
        logger_1.logger.error('Error in getPatientProfile:', error);
        return res.status(500).json({ message: 'Failed to retrieve patient profile' });
    }
};
exports.getPatientProfile = getPatientProfile;
/**
 * 用户个人资料API
 */
// 更新个人基本信息
const updateProfile = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { firstName, lastName, phone, address, dateOfBirth, bloodType, height, weight } = req.body;
        // Log received data for debugging
        logger_1.logger.info(`Updating profile for patient ID: ${patientId}`);
        logger_1.logger.debug(`Profile update data: ${JSON.stringify({
            firstName, lastName, phone,
            address: typeof address === 'object' ? '[Address Object]' : address,
            dateOfBirth, bloodType, height, weight
        })}`);
        // 开始事务
        const client = await db_client_1.default.getClient();
        try {
            await client.query('BEGIN');
            // 更新用户表中的基本信息
            if (firstName || lastName || phone || address) {
                // 准备SQL查询和参数
                let setClauses = [];
                let queryParams = [];
                let paramIndex = 1;
                // 处理常规字段
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
                // 特殊处理地址字段
                if (address) {
                    // 地址现在是varchar类型，直接处理为字符串
                    let addressString = '';
                    try {
                        if (typeof address === 'object' && address !== null) {
                            // 如果是对象，将其格式化为字符串
                            const parts = [];
                            if (address.street)
                                parts.push(address.street);
                            if (address.city)
                                parts.push(address.city);
                            if (address.state)
                                parts.push(address.state);
                            if (address.zipCode)
                                parts.push(address.zipCode);
                            if (address.country)
                                parts.push(address.country);
                            addressString = parts.join(', ');
                            logger_1.logger.debug(`Object address converted to string: ${addressString}`);
                        }
                        else if (typeof address === 'string') {
                            // 如果已经是字符串，直接使用
                            addressString = address.trim();
                            logger_1.logger.debug(`Using string address: ${addressString}`);
                        }
                        // 添加到SQL查询中
                        setClauses.push(`address = $${paramIndex}`);
                        queryParams.push(addressString);
                        paramIndex++;
                    }
                    catch (e) {
                        logger_1.logger.error('Error processing address:', e);
                        setClauses.push(`address = $${paramIndex}`);
                        queryParams.push('');
                        paramIndex++;
                    }
                }
                // 完成SQL查询
                const userUpdateQuery = `
          UPDATE users
          SET ${setClauses.join(', ')}
          WHERE user_id = $${paramIndex}
          RETURNING user_id, first_name, last_name, phone, address
        `;
                // 添加用户ID参数
                queryParams.push(patientId);
                // 打印最终SQL和参数用于调试
                logger_1.logger.debug(`Final SQL query: ${userUpdateQuery.replace(/\s+/g, ' ')}`);
                logger_1.logger.debug(`Query parameters: ${JSON.stringify(queryParams)}`);
                // 执行查询
                const userResult = await client.query(userUpdateQuery, queryParams);
                if (userResult.rows.length === 0) {
                    throw new Error('User not found');
                }
                else {
                    logger_1.logger.debug(`Update successful, returned data: ${JSON.stringify(userResult.rows[0])}`);
                }
            }
            // 更新患者表中的信息
            if (dateOfBirth || bloodType || height || weight) {
                const patientUpdateQuery = `
          UPDATE patients
          SET
            ${dateOfBirth ? 'date_of_birth = $1' : ''}
            ${dateOfBirth && (bloodType || height || weight) ? ',' : ''}
            ${bloodType ? 'blood_type = $2' : ''}
            ${bloodType && (height || weight) ? ',' : ''}
            ${height ? 'height = $3' : ''}
            ${height && weight ? ',' : ''}
            ${weight ? 'weight = $4' : ''}
          WHERE patient_id = $5
          RETURNING patient_id
        `;
                const patientParams = [];
                if (dateOfBirth)
                    patientParams.push(dateOfBirth);
                if (bloodType)
                    patientParams.push(bloodType);
                if (height)
                    patientParams.push(height);
                if (weight)
                    patientParams.push(weight);
                patientParams.push(patientId);
                const patientResult = await client.query(patientUpdateQuery, patientParams);
                if (patientResult.rows.length === 0) {
                    throw new Error('Patient not found');
                }
            }
            // 提交事务
            await client.query('COMMIT');
            // 返回更新后的完整资料
            const updatedProfileQuery = `
        SELECT 
          p.patient_id as id,
          p.patient_id as "userId",
          p.date_of_birth as "dateOfBirth",
          p.blood_type as "bloodGroup",
          p.height,
          p.weight,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.email,
          u.phone,
          u.address,
          u.profile_image_blob
        FROM patients p
        JOIN users u ON p.patient_id = u.user_id
        WHERE p.patient_id = $1
      `;
            const updatedProfile = await db_client_1.default.query(updatedProfileQuery, [patientId]);
            // 格式化用户资料的返回，确保复杂对象如地址能够正确传递
            const profile = updatedProfile.rows[0];
            // 如果地址是JSON字符串，尝试解析它
            if (profile.address && typeof profile.address === 'string') {
                try {
                    profile.address = JSON.parse(profile.address);
                }
                catch (e) {
                    // 如果解析失败，保持原样
                    logger_1.logger.warn('Failed to parse address JSON:', e);
                }
            }
            return res.status(200).json(profile);
        }
        catch (error) {
            // 回滚事务
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            // 释放客户端
            client.release();
        }
    }
    catch (error) {
        logger_1.logger.error('Error in updateProfile:', error);
        if (error instanceof Error) {
            logger_1.logger.error('Error details:', error.message, error.stack);
            // Check for specific errors and provide better error messages
            if (error.message.includes('invalid input syntax')) {
                return res.status(400).json({
                    message: 'Invalid data format',
                    details: error.message
                });
            }
            if (error.message.includes('User not found') || error.message.includes('Patient not found')) {
                return res.status(404).json({
                    message: error.message
                });
            }
        }
        return res.status(500).json({
            message: 'Failed to update profile',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateProfile = updateProfile;
// 更改密码
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Log attempt (without showing the actual passwords)
        logger_1.logger.info(`Password change attempt for user ID: ${userId}`);
        // Validate input
        if (!currentPassword || !newPassword) {
            logger_1.logger.warn('Missing required password fields');
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        }
        if (newPassword.length < 6) {
            logger_1.logger.warn('New password too short');
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        // 验证当前密码
        const passwordQuery = `
      SELECT password_hash FROM users WHERE user_id = $1
    `;
        const passwordResult = await db_client_1.default.query(passwordQuery, [userId]);
        if (passwordResult.rows.length === 0) {
            logger_1.logger.warn(`User ID ${userId} not found when changing password`);
            return res.status(404).json({ message: 'User not found' });
        }
        const currentPasswordHash = passwordResult.rows[0].password_hash;
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
        if (!isPasswordValid) {
            logger_1.logger.warn(`Invalid current password for user ID ${userId}`);
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // 更新新密码
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const updateQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING user_id
    `;
        const updateResult = await db_client_1.default.query(updateQuery, [hashedPassword, userId]);
        if (updateResult.rows.length === 0) {
            logger_1.logger.error(`Failed to update password for user ID ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }
        logger_1.logger.info(`Password successfully updated for user ID ${userId}`);
        return res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        logger_1.logger.error('Error in changePassword:', error);
        if (error instanceof Error) {
            logger_1.logger.error('Error details:', error.message, error.stack);
        }
        return res.status(500).json({ message: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
/**
 * 过敏信息API
 */
// 获取所有过敏信息
const getAllergies = async (req, res) => {
    try {
        const patientId = req.user.id;
        const query = `
      SELECT 
        allergy_id as id,
        name as "allergyName",
        severity,
        reaction,
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patient_allergies
      WHERE patient_id = $1
      ORDER BY created_at DESC
    `;
        const result = await db_client_1.default.query(query, [patientId]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        logger_1.logger.error('Error in getAllergies:', error);
        return res.status(500).json({ message: 'Failed to retrieve allergies' });
    }
};
exports.getAllergies = getAllergies;
// 添加过敏信息
const addAllergy = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { allergyName, severity, reaction, notes } = req.body;
        // Log the request body for debugging
        logger_1.logger.info(`Adding allergy with data: ${JSON.stringify(req.body)}`);
        // Validate required fields
        if (!allergyName || !severity) {
            logger_1.logger.warn('Missing required fields for allergy:', { allergyName, severity });
            return res.status(400).json({ message: 'Allergy name and severity are required' });
        }
        const query = `
      INSERT INTO patient_allergies (
        patient_id, 
        name, 
        severity, 
        reaction, 
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        allergy_id as id,
        name as "allergyName",
        severity,
        reaction,
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
        const result = await db_client_1.default.query(query, [
            patientId,
            allergyName,
            severity,
            reaction || null,
            notes || null
        ]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        logger_1.logger.error('Error in addAllergy:', error);
        if (error instanceof Error) {
            logger_1.logger.error('Error details:', error.message, error.stack);
        }
        return res.status(500).json({ message: 'Failed to add allergy' });
    }
};
exports.addAllergy = addAllergy;
// 更新过敏信息
const updateAllergy = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { id } = req.params;
        const { allergyName, severity, reaction, notes } = req.body;
        // 验证过敏信息属于当前患者
        const verifyQuery = `
      SELECT allergy_id FROM patient_allergies
      WHERE allergy_id = $1 AND patient_id = $2
    `;
        const verifyResult = await db_client_1.default.query(verifyQuery, [id, patientId]);
        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Allergy not found or not authorized' });
        }
        // 更新过敏信息
        const updateQuery = `
      UPDATE patient_allergies
      SET 
        name = $1,
        severity = $2,
        reaction = $3,
        notes = $4,
        updated_at = NOW()
      WHERE allergy_id = $5 AND patient_id = $6
      RETURNING 
        allergy_id as id,
        name as "allergyName",
        severity,
        reaction,
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
        const result = await db_client_1.default.query(updateQuery, [
            allergyName,
            severity,
            reaction || null,
            notes || null,
            id,
            patientId
        ]);
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        logger_1.logger.error('Error in updateAllergy:', error);
        return res.status(500).json({ message: 'Failed to update allergy' });
    }
};
exports.updateAllergy = updateAllergy;
// 删除过敏信息
const deleteAllergy = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { id } = req.params;
        // 验证过敏信息属于当前患者
        const verifyQuery = `
      SELECT allergy_id FROM patient_allergies
      WHERE allergy_id = $1 AND patient_id = $2
    `;
        const verifyResult = await db_client_1.default.query(verifyQuery, [id, patientId]);
        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Allergy not found or not authorized' });
        }
        // 删除过敏信息
        const deleteQuery = `
      DELETE FROM patient_allergies
      WHERE allergy_id = $1 AND patient_id = $2
    `;
        await db_client_1.default.query(deleteQuery, [id, patientId]);
        return res.status(200).json({ message: 'Allergy deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Error in deleteAllergy:', error);
        return res.status(500).json({ message: 'Failed to delete allergy' });
    }
};
exports.deleteAllergy = deleteAllergy;
/**
 * 紧急联系人API
 */
// 获取所有紧急联系人
const getEmergencyContacts = async (req, res) => {
    try {
        const patientId = req.user.id;
        const query = `
      SELECT 
        contact_id as id,
        name,
        relationship,
        phone,
        address,
        is_default as "isPrimary",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM emergency_contacts
      WHERE patient_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
        const result = await db_client_1.default.query(query, [patientId]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        logger_1.logger.error('Error in getEmergencyContacts:', error);
        return res.status(500).json({ message: 'Failed to retrieve emergency contacts' });
    }
};
exports.getEmergencyContacts = getEmergencyContacts;
// 添加紧急联系人
const addEmergencyContact = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { name, relationship, phone, address, isPrimary } = req.body;
        const client = await db_client_1.default.getClient();
        try {
            await client.query('BEGIN');
            // 如果新联系人是主要联系人，先将其他联系人设为非主要
            if (isPrimary) {
                const updateQuery = `
          UPDATE emergency_contacts
          SET is_default = false
          WHERE patient_id = $1 AND is_default = true
        `;
                await client.query(updateQuery, [patientId]);
            }
            // 插入新联系人
            const insertQuery = `
        INSERT INTO emergency_contacts (
          patient_id,
          name,
          relationship,
          phone,
          address,
          is_default
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          contact_id as id,
          name,
          relationship,
          phone,
          address,
          is_default as "isPrimary",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
            // 处理地址数据为字符串
            let addressValue = '';
            try {
                if (typeof address === 'object' && address !== null) {
                    // 如果是对象，将其格式化为字符串
                    const parts = [];
                    if (address.street)
                        parts.push(address.street);
                    if (address.city)
                        parts.push(address.city);
                    if (address.state)
                        parts.push(address.state);
                    if (address.zipCode)
                        parts.push(address.zipCode);
                    if (address.country)
                        parts.push(address.country);
                    addressValue = parts.join(', ');
                }
                else if (typeof address === 'string' && address.trim()) {
                    // 如果已经是字符串，直接使用
                    addressValue = address.trim();
                }
                else {
                    // 空值处理
                    addressValue = '';
                }
                logger_1.logger.debug(`New emergency contact address processed: ${addressValue}`);
            }
            catch (e) {
                logger_1.logger.error('Error processing new emergency contact address:', e);
                addressValue = '';
            }
            const result = await client.query(insertQuery, [
                patientId,
                name,
                relationship,
                phone,
                addressValue,
                isPrimary || false
            ]);
            await client.query('COMMIT');
            return res.status(201).json(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        logger_1.logger.error('Error in addEmergencyContact:', error);
        return res.status(500).json({ message: 'Failed to add emergency contact' });
    }
};
exports.addEmergencyContact = addEmergencyContact;
// 更新紧急联系人
const updateEmergencyContact = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { id } = req.params;
        const { name, relationship, phone, address, isPrimary } = req.body;
        const client = await db_client_1.default.getClient();
        try {
            await client.query('BEGIN');
            // 验证联系人属于当前患者
            const verifyQuery = `
        SELECT contact_id FROM emergency_contacts
        WHERE contact_id = $1 AND patient_id = $2
      `;
            const verifyResult = await client.query(verifyQuery, [id, patientId]);
            if (verifyResult.rows.length === 0) {
                return res.status(404).json({ message: 'Emergency contact not found or not authorized' });
            }
            // 如果设为主要联系人，先将其他联系人设为非主要
            if (isPrimary) {
                const updatePrimaryQuery = `
          UPDATE emergency_contacts
          SET is_default = false
          WHERE patient_id = $1 AND contact_id != $2 AND is_default = true
        `;
                await client.query(updatePrimaryQuery, [patientId, id]);
            }
            // 更新联系人信息
            const updateQuery = `
        UPDATE emergency_contacts
        SET 
          name = $1,
          relationship = $2,
          phone = $3,
          address = $4,
          is_default = $5,
          updated_at = NOW()
        WHERE contact_id = $6 AND patient_id = $7
        RETURNING 
          contact_id as id,
          name,
          relationship,
          phone,
          address,
          is_default as "isPrimary",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
            // 处理地址数据为字符串
            let addressValue = '';
            try {
                if (typeof address === 'object' && address !== null) {
                    // 如果是对象，将其格式化为字符串
                    const parts = [];
                    if (address.street)
                        parts.push(address.street);
                    if (address.city)
                        parts.push(address.city);
                    if (address.state)
                        parts.push(address.state);
                    if (address.zipCode)
                        parts.push(address.zipCode);
                    if (address.country)
                        parts.push(address.country);
                    addressValue = parts.join(', ');
                }
                else if (typeof address === 'string' && address.trim()) {
                    // 如果已经是字符串，直接使用
                    addressValue = address.trim();
                }
                else {
                    // 空值处理
                    addressValue = '';
                }
                logger_1.logger.debug(`Emergency contact address processed: ${addressValue}`);
            }
            catch (e) {
                logger_1.logger.error('Error processing emergency contact address:', e);
                addressValue = '';
            }
            const result = await client.query(updateQuery, [
                name,
                relationship,
                phone,
                addressValue,
                isPrimary || false,
                id,
                patientId
            ]);
            await client.query('COMMIT');
            return res.status(200).json(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        logger_1.logger.error('Error in updateEmergencyContact:', error);
        if (error instanceof Error) {
            logger_1.logger.error('Error details:', error.message, error.stack);
        }
        return res.status(500).json({ message: 'Failed to update emergency contact' });
    }
};
exports.updateEmergencyContact = updateEmergencyContact;
// 删除紧急联系人
const deleteEmergencyContact = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { id } = req.params;
        // 验证联系人属于当前患者
        const verifyQuery = `
      SELECT contact_id FROM emergency_contacts
      WHERE contact_id = $1 AND patient_id = $2
    `;
        const verifyResult = await db_client_1.default.query(verifyQuery, [id, patientId]);
        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Emergency contact not found or not authorized' });
        }
        // 删除联系人
        const deleteQuery = `
      DELETE FROM emergency_contacts
      WHERE contact_id = $1 AND patient_id = $2
    `;
        await db_client_1.default.query(deleteQuery, [id, patientId]);
        return res.status(200).json({ message: 'Emergency contact deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Error in deleteEmergencyContact:', error);
        if (error instanceof Error) {
            logger_1.logger.error('Error details:', error.message, error.stack);
        }
        return res.status(500).json({ message: 'Failed to delete emergency contact' });
    }
};
exports.deleteEmergencyContact = deleteEmergencyContact;
//# sourceMappingURL=patient-setting.controller.js.map