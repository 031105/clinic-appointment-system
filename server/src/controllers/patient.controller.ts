import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class PatientController {
  // Get patient profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const patient = await prisma.patient.findUnique({
        where: { id: userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              address: true,
              profileImage: true,
              status: true,
            },
          },
          allergies: true,
          emergencyContacts: true,
        },
      });

      if (!patient) {
        throw new ApiError(404, 'Patient not found');
      }

      res.json({
        status: 'success',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update patient profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const {
        dateOfBirth,
        bloodGroup,
        height,
        weight,
        medicalHistory,
        insuranceInfo,
      } = req.body;

      const updatedPatient = await prisma.patient.update({
        where: { id: userId },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          bloodGroup,
          height,
          weight,
          medicalHistory,
          insuranceInfo,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      res.json({
        status: 'success',
        data: updatedPatient,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get medical records
  async getMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId: userId },
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

  // Manage allergies
  async addAllergy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { allergyName, severity, diagnosedDate, notes } = req.body;

      const allergy = await prisma.patientAllergy.create({
        data: {
          patientId: userId,
          allergyName,
          severity,
          diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : undefined,
          notes,
        },
      });

      res.status(201).json({
        status: 'success',
        data: allergy,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAllergy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const allergyId = parseInt(id);
      const { allergyName, severity, diagnosedDate, notes } = req.body;

      const allergy = await prisma.patientAllergy.findFirst({
        where: {
          id: allergyId,
          patientId: userId,
        },
      });

      if (!allergy) {
        throw new ApiError(404, 'Allergy not found');
      }

      const updatedAllergy = await prisma.patientAllergy.update({
        where: { id: allergyId },
        data: {
          allergyName,
          severity,
          diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : undefined,
          notes,
        },
      });

      res.json({
        status: 'success',
        data: updatedAllergy,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllergy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const allergyId = parseInt(id);

      const allergy = await prisma.patientAllergy.findFirst({
        where: {
          id: allergyId,
          patientId: userId,
        },
      });

      if (!allergy) {
        throw new ApiError(404, 'Allergy not found');
      }

      await prisma.patientAllergy.delete({
        where: { id: allergyId },
      });

      res.json({
        status: 'success',
        message: 'Allergy deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Manage emergency contacts
  async addEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { name, relationship, phone, email, address, isPrimary } = req.body;

      // If this is the primary contact, remove primary status from other contacts
      if (isPrimary) {
        await prisma.emergencyContact.updateMany({
          where: { patientId: userId },
          data: { isPrimary: false },
        });
      }

      const contact = await prisma.emergencyContact.create({
        data: {
          patientId: userId,
          name,
          relationship,
          phone,
          email,
          address,
          isPrimary,
        },
      });

      res.status(201).json({
        status: 'success',
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const contactId = parseInt(id);
      const { name, relationship, phone, email, address, isPrimary } = req.body;

      const contact = await prisma.emergencyContact.findFirst({
        where: {
          id: contactId,
          patientId: userId,
        },
      });

      if (!contact) {
        throw new ApiError(404, 'Emergency contact not found');
      }

      // If this is being set as primary, remove primary status from other contacts
      if (isPrimary) {
        await prisma.emergencyContact.updateMany({
          where: {
            patientId: userId,
            id: { not: contactId },
          },
          data: { isPrimary: false },
        });
      }

      const updatedContact = await prisma.emergencyContact.update({
        where: { id: contactId },
        data: {
          name,
          relationship,
          phone,
          email,
          address,
          isPrimary,
        },
      });

      res.json({
        status: 'success',
        data: updatedContact,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const contactId = parseInt(id);

      const contact = await prisma.emergencyContact.findFirst({
        where: {
          id: contactId,
          patientId: userId,
        },
      });

      if (!contact) {
        throw new ApiError(404, 'Emergency contact not found');
      }

      await prisma.emergencyContact.delete({
        where: { id: contactId },
      });

      res.json({
        status: 'success',
        message: 'Emergency contact deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
} 