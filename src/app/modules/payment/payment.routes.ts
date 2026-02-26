import express from 'express';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import { paymentController, handleStripeWebhook } from './payment.controller';
const router = express.Router()

router.post(
    "/stripe/create-intent",
    authHelper(Role.TOURIST),
    paymentController.createStripeIntent
);

router.post(
    "/checkout",
    authHelper(Role.TOURIST),
    paymentController.createCheckoutSession
);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handleStripeWebhook
);



export const paymentRoutes = router