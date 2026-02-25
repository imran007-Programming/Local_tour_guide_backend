import express from 'express';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import { reviewController } from './review.controller';

const router = express.Router()

router.get("/", reviewController.getAllReviews)
router.get("/tour/:tourId", reviewController.getTourReviews)
router.get("/guide/:guideId", reviewController.getGuideReviews)
router.get("/me", authHelper(Role.TOURIST), reviewController.getMyReviews)
router.post("/", authHelper(Role.TOURIST), reviewController.createReview)
router.patch("/:id", authHelper(Role.TOURIST), reviewController.updateReview)
router.delete("/:id", authHelper(Role.TOURIST, Role.ADMIN), reviewController.deleteReview)


export const reviewRoutes = router;