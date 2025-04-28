import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

export class MedicalRecordController {
  // Create a new medical record (for doctors)
  async createMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const {
        appointmentId,
        patientId,
        diagnosis,
        symptoms,
        prescription,
        testResults,
        notes,
        followUpDate,
      } = req.body;

      // Check if appointment exists and belongs to this doctor
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: parseInt(appointmentId),
          doctorId,
          status: 'completed',
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found or not completed');
      }

      // Check if medical record already exists for this appointment
      const existingRecord = await prisma.medicalRecord.findUnique({
        where: {
          appointmentId: parseInt(appointmentId),
        },
      });

      if (existingRecord) {
        throw new ApiError(400, 'Medical record already exists for this appointment');
      }

      // Create the medical record
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          appointmentId: parseInt(appointmentId),
          patientId: parseInt(patientId),
          doctorId,
          diagnosis,
          symptoms,
          prescription,
          testResults: testResults || {},
          notes,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });

      // Update appointment status if not already completed
      await prisma.appointment.update({
        where: {
          id: parseInt(appointmentId),
        },
        data: {
          status: 'completed',
        },
      });

      // Notify patient via email if they have an email
      if (appointment.patient.user.email) {
        await sendEmail({
          to: appointment.patient.user.email,
          subject: 'New Medical Record Available',
          text: `Dear ${appointment.patient.user.firstName},\n\nA new medical record has been created for your recent appointment. Please log in to view the details.\n\nRegards,\nClinic Team`,
        });
      }

      res.status(201).json({
        status: 'success',
        data: medicalRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update an existing medical record (for doctors)
  async updateMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const recordId = parseInt(id);
      const {
        diagnosis,
        symptoms,
        prescription,
        testResults,
        notes,
        followUpDate,
      } = req.body;

      // Check if medical record exists and belongs to this doctor
      const existingRecord = await prisma.medicalRecord.findFirst({
        where: {
          id: recordId,
          doctorId,
        },
      });

      if (!existingRecord) {
        throw new ApiError(404, 'Medical record not found');
      }

      // Update the medical record
      const medicalRecord = await prisma.medicalRecord.update({
        where: {
          id: recordId,
        },
        data: {
          diagnosis,
          symptoms,
          prescription,
          testResults: testResults || undefined,
          notes,
          followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        },
      });

      res.json({
        status: 'success',
        data: medicalRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a specific medical record by ID (for both doctor and patient)
  async getMedicalRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const recordId = parseInt(id);

      // Get user role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              department: true,
            },
          },
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          appointment: true,
        },
      });

      if (!medicalRecord) {
        throw new ApiError(404, 'Medical record not found');
      }

      // Check if user has permission to view this record
      if (
        user.role.name !== 'admin' &&
        medicalRecord.doctorId !== userId &&
        medicalRecord.patientId !== userId
      ) {
        throw new ApiError(403, 'Not authorized to view this medical record');
      }

      res.json({
        status: 'success',
        data: medicalRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all medical records for a specific patient (for doctors and the patient)
  async getPatientMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { patientId } = req.params;
      const patientIdInt = parseInt(patientId);

      // Get user role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Check if user has permission to view these records
      if (
        user.role.name !== 'admin' &&
        user.role.name !== 'doctor' &&
        patientIdInt !== userId
      ) {
        throw new ApiError(403, 'Not authorized to view these medical records');
      }

      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId: patientIdInt },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              department: true,
            },
          },
          appointment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        status: 'success',
        data: medicalRecords,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all medical records created by a specific doctor
  async getDoctorMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      // Only allow doctors to access their own records or admins to access any
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const { doctorId } = req.params;
      const doctorIdInt = parseInt(doctorId);

      if (user.role.name !== 'admin' && doctorIdInt !== userId) {
        throw new ApiError(403, 'Not authorized to view these medical records');
      }

      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { doctorId: doctorIdInt },
        include: {
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
          appointment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        status: 'success',
        data: medicalRecords,
      });
    } catch (error) {
      next(error);
    }
  }
} 