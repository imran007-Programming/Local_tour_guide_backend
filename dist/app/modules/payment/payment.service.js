"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const prisma_1 = require("../../lib/prisma");
const stripe_1 = require("../../lib/stripe");
const client_1 = require("@prisma/client");
const createStripeIntent = async (user, bookingId) => {
    if (user.role !== client_1.Role.TOURIST) {
        throw new ApiError_1.default(403, "Only tourists can pay");
    }
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: { userId: user.userId }
    });
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId }
    });
    if (!booking || booking.touristId !== tourist?.id) {
        throw new ApiError_1.default(404, "Booking not found");
    }
    if (booking.status !== client_1.BookingStatus.PENDING) {
        throw new ApiError_1.default(400, "Booking must be in pending status to make payment");
    }
    let payment = await prisma_1.prisma.payment.findUnique({
        where: { bookingId }
    });
    if (payment?.status === client_1.PaymentStatus.PAID) {
        throw new ApiError_1.default(400, "You already paid for this tour");
    }
    const tour = await prisma_1.prisma.tour.findUnique({
        where: {
            id: booking?.tourId
        }
    });
    if (!payment) {
        payment = await prisma_1.prisma.payment.create({
            data: {
                bookingId,
                amount: tour?.price,
                status: client_1.PaymentStatus.PENDING,
                transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            }
        });
    }
    const paymentIntent = await stripe_1.stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100),
        currency: "usd",
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never"
        },
        metadata: {
            bookingId,
            paymentId: payment.id
        }
    });
    await prisma_1.prisma.payment.update({
        where: { id: payment.id },
        data: {
            paymentIntentId: paymentIntent.id
        }
    });
    return {
        clientSecret: paymentIntent.client_secret
    };
};
exports.paymentService = {
    createStripeIntent
};
