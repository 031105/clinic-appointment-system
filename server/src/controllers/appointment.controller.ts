import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

export class AppointmentController {
  // Create new appointment
  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.id;
      if (!patientId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const {
        doctorId,
        appointmentDateTime,
        duration = 30,
        type,
        reason,
        symptoms,
      } = req.body;

      // Check if doctor exists and is active
      const doctor = await prisma.doctor.findFirst({
        where: {
          id: doctorId,
          user: {
            status: 'active',
          },
        },
        include: {
          schedules: true,
          user: true,
        },
      });

      if (!doctor) {
        throw new ApiError(404, 'Doctor not found or inactive');
      }

      // Check if the time slot is available
      const appointmentDate = new Date(appointmentDateTime);
      const dayOfWeek = appointmentDate.getDay();
      const timeStr = appointmentDate.toTimeString().slice(0, 5);

      // Check if doctor has schedule for this day
      const schedule = doctor.schedules.find(s => s.dayOfWeek === dayOfWeek);
      if (!schedule) {
        throw new ApiError(400, 'Doctor is not available on this day');
      }

      // Check if the time is within doctor's working hours
      if (new Date(`1970-01-01T${timeStr}`) < new Date(`1970-01-01T${schedule.startTime}`) || 
          new Date(`1970-01-01T${timeStr}`) > new Date(`1970-01-01T${schedule.endTime}`)) {
        throw new ApiError(400, 'Selected time is outside doctor\'s working hours');
      }

      // Check for existing appointments at the same time
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          appointmentDateTime,
          status: {
            in: ['scheduled', 'completed'],
          },
        },
      });

      if (existingAppointment) {
        throw new ApiError(400, 'This time slot is already booked');
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          appointmentDateTime,
          duration,
          type,
          reason,
          symptoms,
          status: 'scheduled',
          createdById: patientId,
        },
        include: {
          doctor: {
            include: {
              user: true,
              department: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      // Send confirmation email to patient
      const patientUser = await prisma.user.findUnique({
        where: { id: patientId },
      });

      if (patientUser?.email) {
        await sendEmail({
          to: patientUser.email,
          subject: 'Appointment Confirmation',
          text: `Your appointment has been scheduled for ${appointmentDateTime} with Dr. ${doctor.user.firstName} ${doctor.user.lastName}.`,
        });
      }

      res.status(201).json({
        status: 'success',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get appointments (for both doctors and patients)
  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { status, startDate, endDate } = req.query;

      // Get user role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const where: any = {};

      // Filter by user role
      if (user.role.name === 'doctor') {
        where.doctorId = userId;
      } else if (user.role.name === 'patient') {
        where.patientId = userId;
      }

      // Filter by status
      if (status) {
        where.status = status;
      }

      // Filter by date range
      if (startDate || endDate) {
        where.appointmentDateTime = {};
        if (startDate) {
          where.appointmentDateTime.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.appointmentDateTime.lte = new Date(endDate as string);
        }
      }

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            include: {
              user: true,
              department: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          appointmentDateTime: 'desc',
        },
      });

      res.json({
        status: 'success',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get appointment by ID
  async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const appointmentId = parseInt(id);

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!currentUser) {
        throw new ApiError(404, 'User not found');
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          doctor: {
            include: {
              user: true,
              department: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
          medicalRecord: true,
        },
      });

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      // Check if user has access to this appointment
      if (
        appointment.patientId !== userId &&
        appointment.doctorId !== userId &&
        currentUser.role.name !== 'admin'
      ) {
        throw new ApiError(403, 'Not authorized to view this appointment');
      }

      res.json({
        status: 'success',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!currentUser) {
        throw new ApiError(404, 'User not found');
      }

      const { id } = req.params;
      const appointmentId = parseInt(id);
      const { status, cancellationReason } = req.body;

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      // Check if user has permission to update this appointment
      if (
        appointment.patientId !== userId &&
        appointment.doctorId !== userId &&
        currentUser.role.name !== 'admin'
      ) {
        throw new ApiError(403, 'Not authorized to update this appointment');
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status,
          cancellationReason,
          cancelledById: status === 'cancelled' ? userId : null,
        },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      // Send email notification
      if (status === 'cancelled') {
        const recipientEmail = userId === appointment.patientId
          ? appointment.doctor.user.email
          : appointment.patient.user.email;

        await sendEmail({
          to: recipientEmail,
          subject: 'Appointment Cancelled',
          text: `The appointment scheduled for ${appointment.appointmentDateTime} has been cancelled. ${cancellationReason ? `Reason: ${cancellationReason}` : ''}`,
        });
      }

      res.json({
        status: 'success',
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }
} 