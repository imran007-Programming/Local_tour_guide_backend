import express from 'express';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import { reviewController } from './review.controller';

const router = express.Router()

router.post("/", authHelper(Role.TOURIST), reviewController.createReview)


export const reviewRoutes = router;