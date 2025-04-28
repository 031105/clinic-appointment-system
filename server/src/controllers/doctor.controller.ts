import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class DoctorController {
  // Get all doctors
  async getAllDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId, specialization } = req.query;

      const where: any = {
        user: {
          status: 'active',
        },
      };

      if (departmentId) {
        where.departmentId = parseInt(departmentId as string);
      }

      if (specialization) {
        where.specializations = {
          has: specialization as string,
        };
      }

      const doctors = await prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          department: true,
          schedules: true,
        },
      });

      res.json({
        status: 'success',
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get doctor by ID
  async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doctorId = parseInt(id);

      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          department: true,
          schedules: true,
          reviews: {
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
            },
            where: {
              isPublic: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
      }

      res.json({
        status: 'success',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get doctor's schedule
  async getDoctorSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doctorId = parseInt(id);
      const { startDate, endDate } = req.query;

      // Validate date range
      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(start);
      end.setDate(end.getDate() + 7); // Default to 7 days if no end date

      // Get regular schedule
      const schedules = await prisma.doctorSchedule.findMany({
        where: {
          doctorId,
          isActive: true,
        },
      });

      // Get unavailable times
      const unavailableTimes = await prisma.doctorUnavailability.findMany({
        where: {
          doctorId,
          startDateTime: {
            gte: start,
            lte: end,
          },
        },
      });

      // Get existing appointments
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDateTime: {
            gte: start,
            lte: end,
          },
          status: {
            in: ['scheduled', 'completed'],
          },
        },
        select: {
          appointmentDateTime: true,
          duration: true,
        },
      });

      res.json({
        status: 'success',
        data: {
          regularSchedule: schedules,
          unavailableTimes,
          appointments,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update doctor's schedule
  async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { schedules } = req.body;

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing schedules
        await tx.doctorSchedule.deleteMany({
          where: { doctorId },
        });

        // Create new schedules
        const newSchedules = await Promise.all(
          schedules.map((schedule: any) =>
            tx.doctorSchedule.create({
              data: {
                doctorId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                breakStart: schedule.breakStart,
                breakEnd: schedule.breakEnd,
                slotDuration: schedule.slotDuration,
                isActive: true,
              },
            })
          )
        );

        return newSchedules;
      });

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Add unavailable time
  async addUnavailableTime(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { startDateTime, endDateTime, reason } = req.body;

      const unavailableTime = await prisma.doctorUnavailability.create({
        data: {
          doctorId,
          startDateTime: new Date(startDateTime),
          endDateTime: new Date(endDateTime),
          reason,
        },
      });

      res.json({
        status: 'success',
        data: unavailableTime,
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove unavailable time
  async removeUnavailableTime(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const unavailabilityId = parseInt(id);

      await prisma.doctorUnavailability.delete({
        where: {
          id: unavailabilityId,
          doctorId,
        },
      });

      res.json({
        status: 'success',
        message: 'Unavailable time removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
} 