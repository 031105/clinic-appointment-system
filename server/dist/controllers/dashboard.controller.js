"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientProfile = exports.getPatientAppointments = exports.getDoctors = exports.getDepartments = void 0;
const db_client_1 = __importDefault(require("../utils/db-client"));
const logger_1 = require("../utils/logger");
/**
 * 获取所有部门列表
 */
const getDepartments = async (_req, res) => {
    try {
        const result = await db_client_1.default.query(`
      SELECT 
        d.department_id as id, 
        d.name, 
        d.description, 
        d.emoji_icon as "emojiIcon",
        (SELECT COUNT(*) FROM doctors WHERE department_id = d.department_id) as "doctorCount"
      FROM departments d
      ORDER BY d.name
    `);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        logger_1.logger.error('Error in getDepartments:', error);
        return res.status(500).json({ message: 'Failed to retrieve departments' });
    }
};
exports.getDepartments = getDepartments;
/**
 * 获取医生列表，可按部门筛选
 */
const getDoctors = async (req, res) => {
    try {
        const { departmentId } = req.query;
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;
        const params = [];
        let query = `
      SELECT 
        d.doctor_id as id,
        d.doctor_id as "userId",
        d.department_id as "departmentId",
        d.specialty as "specialty",
        d.qualification as "qualifications",
        d.experience as "experienceYears",
        d.consultation_fee as "consultationFee",
        d.bio as about,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone,
        u.profile_image_blob as "profilePicture",
        dep.name as "departmentName",
        COALESCE(r.avg_rating, 0) as "averageRating",
        COALESCE(r.review_count, 0) as "reviewCount"
      FROM doctors d
      JOIN users u ON d.doctor_id = u.user_id
      JOIN departments dep ON d.department_id = dep.department_id
      LEFT JOIN (
        SELECT 
          doctor_id, 
          AVG(rating) as avg_rating, 
          COUNT(*) as review_count 
        FROM reviews 
        WHERE status = 'approved' 
        GROUP BY doctor_id
      ) r ON d.doctor_id = r.doctor_id
      WHERE u.status = 'active'
    `;
        if (departmentId) {
            query += ` AND d.department_id = $${params.length + 1}`;
            params.push(departmentId);
        }
        query += ` 
      ORDER BY r.avg_rating DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
        params.push(limit, offset);
        const result = await db_client_1.default.query(query, params);
        // 格式化返回数据
        const doctors = result.rows.map(row => ({
            id: row.id,
            userId: row.userId,
            departmentId: row.departmentId,
            specializations: row.specialty ? [row.specialty] : [],
            qualifications: row.qualifications ? row.qualifications.split(',') : [],
            experienceYears: row.experienceYears,
            consultationFee: row.consultationFee,
            about: row.about,
            user: {
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                phone: row.phone,
                profilePicture: row.profilePicture
            },
            department: {
                id: row.departmentId,
                name: row.departmentName
            },
            averageRating: parseFloat(row.averageRating) || 0,
            reviewCount: row.reviewCount || 0
        }));
        logger_1.logger.info(`Retrieved ${doctors.length} doctors`);
        return res.status(200).json(doctors);
    }
    catch (error) {
        logger_1.logger.error('Error in getDoctors:', error);
        return res.status(500).json({ message: 'Failed to retrieve doctors' });
    }
};
exports.getDoctors = getDoctors;
/**
 * 获取患者预约列表
 */
const getPatientAppointments = async (req, res) => {
    try {
        // 使用id作为患者ID
        const patientId = req.user.id;
        const status = req.query.status || 'all';
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;
        const params = [patientId];
        let query = `
      SELECT 
        a.appointment_id as id,
        a.patient_id as "patientId",
        a.doctor_id as "doctorId",
        a.appointment_datetime as "appointmentDateTime",
        a.end_datetime as "endDateTime",
        a.status,
        a.type,
        a.reason,
        a.symptoms,
        a.notes,
        a.cancellation_reason as "cancellationReason",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        d.department_id as "departmentId",
        dep.name as "departmentName",
        u.first_name as "doctorFirstName",
        u.last_name as "doctorLastName",
        u.email as "doctorEmail",
        u.phone as "doctorPhone"
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN departments dep ON d.department_id = dep.department_id
      JOIN users u ON d.doctor_id = u.user_id
      WHERE a.patient_id = $1
    `;
        // 根据status参数筛选
        if (status === 'upcoming') {
            query += ` AND a.appointment_datetime > NOW() AND a.status = 'scheduled'`;
        }
        else if (status === 'past') {
            query += ` AND (a.appointment_datetime < NOW() OR a.status IN ('completed', 'cancelled', 'no_show'))`;
        }
        query += `
      ORDER BY a.appointment_datetime DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
        params.push(limit, offset);
        const result = await db_client_1.default.query(query, params);
        // 格式化返回数据
        const appointments = result.rows.map(row => ({
            id: row.id,
            patientId: row.patientId,
            doctorId: row.doctorId,
            appointmentDateTime: row.appointmentDateTime,
            endDateTime: row.endDateTime,
            status: row.status,
            type: row.type,
            reason: row.reason,
            symptoms: row.symptoms || [],
            notes: row.notes,
            cancellationReason: row.cancellationReason,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            doctor: {
                id: row.doctorId,
                userId: row.doctorId,
                department: {
                    id: row.departmentId,
                    name: row.departmentName
                },
                user: {
                    firstName: row.doctorFirstName,
                    lastName: row.doctorLastName,
                    email: row.doctorEmail,
                    phone: row.doctorPhone
                }
            }
        }));
        return res.status(200).json(appointments);
    }
    catch (error) {
        logger_1.logger.error('Error in getPatientAppointments:', error);
        return res.status(500).json({ message: 'Failed to retrieve appointments' });
    }
};
exports.getPatientAppointments = getPatientAppointments;
/**
 * 获取患者个人资料
 */
const getPatientProfile = async (req, res) => {
    try {
        // 使用id作为患者ID
        const patientId = req.user.id;
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
        u.profile_image_blob as "profilePicture"
      FROM patients p
      JOIN users u ON p.patient_id = u.user_id
      WHERE p.patient_id = $1
    `, [patientId]);
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        const patient = patientResult.rows[0];
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
        is_primary as "isPrimary"
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
                profilePicture: patient.profilePicture
            },
            allergies: allergiesResult.rows,
            emergencyContacts: contactsResult.rows
        };
        // 删除冗余字段
        delete profile.firstName;
        delete profile.lastName;
        delete profile.email;
        delete profile.phone;
        delete profile.profilePicture;
        return res.status(200).json(profile);
    }
    catch (error) {
        logger_1.logger.error('Error in getPatientProfile:', error);
        return res.status(500).json({ message: 'Failed to retrieve patient profile' });
    }
};
exports.getPatientProfile = getPatientProfile;
//# sourceMappingURL=dashboard.controller.js.map