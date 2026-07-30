import express from 'express';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import { paymentController } from './payment.controller';
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

// Webhook is handled directly in app.ts with express.raw() before json middleware

router.post(
    "/verify",
    authHelper(Role.TOURIST),
    paymentController.verifyPayment
);

router.post(
    "/cancel",
    authHelper(Role.TOURIST),
    paymentController.handlePaymentCancel
);



export const paymentRoutes = router