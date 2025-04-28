import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class ReviewController {
  // Submit a review for an appointment
  async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { appointmentId, rating, comment, isAnonymous = false } = req.body;

      // Check if the appointment exists and belongs to the patient
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: parseInt(appointmentId),
          patientId: userId,
          status: 'completed',
        },
        include: {
          doctor: true,
        },
      });

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found or not eligible for review');
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          appointmentId: parseInt(appointmentId),
        },
      });

      if (existingReview) {
        throw new ApiError(400, 'Review already exists for this appointment');
      }

      // Create the review
      const review = await prisma.review.create({
        data: {
          appointmentId: parseInt(appointmentId),
          patientId: userId,
          doctorId: appointment.doctorId,
          rating: parseFloat(rating),
          comment,
          isAnonymous,
          isPublic: true,
        },
      });

      // Update doctor's average rating
      const doctorReviews = await prisma.review.findMany({
        where: {
          doctorId: appointment.doctorId,
          isPublic: true,
        },
        select: {
          rating: true,
        },
      });

      const totalRating = doctorReviews.reduce((sum, review) => sum + Number(review.rating), 0);
      const averageRating = totalRating / doctorReviews.length;
      const reviewCount = doctorReviews.length;

      await prisma.doctor.update({
        where: {
          id: appointment.doctorId,
        },
        data: {
          averageRating,
          reviewCount,
        },
      });

      res.status(201).json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update an existing review
  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const reviewId = parseInt(id);
      const { rating, comment, isAnonymous } = req.body;

      // Check if the review exists and belongs to the patient
      const existingReview = await prisma.review.findFirst({
        where: {
          id: reviewId,
          patientId: userId,
        },
        include: {
          doctor: true,
        },
      });

      if (!existingReview) {
        throw new ApiError(404, 'Review not found');
      }

      // Update the review
      const review = await prisma.review.update({
        where: {
          id: reviewId,
        },
        data: {
          rating: rating ? parseFloat(rating) : undefined,
          comment,
          isAnonymous,
        },
      });

      // Update doctor's average rating
      const doctorReviews = await prisma.review.findMany({
        where: {
          doctorId: existingReview.doctorId,
          isPublic: true,
        },
        select: {
          rating: true,
        },
      });

      const totalRating = doctorReviews.reduce((sum, review) => sum + Number(review.rating), 0);
      const averageRating = totalRating / doctorReviews.length;
      const reviewCount = doctorReviews.length;

      await prisma.doctor.update({
        where: {
          id: existingReview.doctorId,
        },
        data: {
          averageRating,
          reviewCount,
        },
      });

      res.json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a review
  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { id } = req.params;
      const reviewId = parseInt(id);

      // Check if the review exists and belongs to the patient
      const existingReview = await prisma.review.findFirst({
        where: {
          id: reviewId,
          patientId: userId,
        },
        include: {
          doctor: true,
        },
      });

      if (!existingReview) {
        throw new ApiError(404, 'Review not found');
      }

      // Delete the review
      await prisma.review.delete({
        where: {
          id: reviewId,
        },
      });

      // Update doctor's average rating
      const doctorReviews = await prisma.review.findMany({
        where: {
          doctorId: existingReview.doctorId,
          isPublic: true,
        },
        select: {
          rating: true,
        },
      });

      if (doctorReviews.length > 0) {
        const totalRating = doctorReviews.reduce((sum, review) => sum + Number(review.rating), 0);
        const averageRating = totalRating / doctorReviews.length;
        const reviewCount = doctorReviews.length;

        await prisma.doctor.update({
          where: {
            id: existingReview.doctorId,
          },
          data: {
            averageRating,
            reviewCount,
          },
        });
      } else {
        await prisma.doctor.update({
          where: {
            id: existingReview.doctorId,
          },
          data: {
            averageRating: null,
            reviewCount: 0,
          },
        });
      }

      res.json({
        status: 'success',
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all reviews for a doctor (public)
  async getDoctorReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId } = req.params;
      const reviews = await prisma.review.findMany({
        where: {
          doctorId: parseInt(doctorId),
          isPublic: true,
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileImage: true,
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
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get reviews submitted by the current patient
  async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, 'Not authenticated');
      }

      const reviews = await prisma.review.findMany({
        where: {
          patientId: userId,
        },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileImage: true,
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
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
} 