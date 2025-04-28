import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  submitReviewSchema,
  updateReviewSchema,
} from '../schemas/review.schema';

const router = Router();
const reviewController = new ReviewController();

// Submit a new review
router.post(
  '/',
  authorize('patient'),
  validateRequest(submitReviewSchema),
  reviewController.submitReview
);

// Update an existing review
router.patch(
  '/:id',
  authorize('patient'),
  validateRequest(updateReviewSchema),
  reviewController.updateReview
);

// Delete a review
router.delete(
  '/:id',
  authorize('patient'),
  reviewController.deleteReview
);

// Get all reviews for a doctor (public endpoint)
router.get(
  '/doctor/:doctorId',
  reviewController.getDoctorReviews
);

// Get all reviews submitted by the current patient
router.get(
  '/my-reviews',
  authorize('patient'),
  reviewController.getMyReviews
);

export default router; 