"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.handleStripeWebhook = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const payment_service_1 = require("./payment.service");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const stripe_1 = require("../../lib/stripe");
const config_1 = __importDefault(require("../../config"));
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const createStripeIntent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await payment_service_1.paymentService.createStripeIntent(req.user, req.body.bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Stripe payment intent created",
        data: result
    });
});
const createCheckoutSession = async (req, res) => {
    const { bookingId, successUrl, cancelUrl } = req.body;
    // 1. find booking
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId },
    });
    if (!booking) {
        throw new ApiError_1.default(404, "Booking not found");
    }
    const payment = await prisma_1.prisma.payment.findUnique({
        where: { bookingId },
    });
    if (!payment) {
        throw new ApiError_1.default(404, "payment not found");
    }
    const session = await stripe_1.stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Tour Booking Payment",
                    },
                    unit_amount: payment?.amount * 100,
                },
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            bookingId: booking.id,
            transactionId: payment.transactionId
        },
        payment_intent_data: {
            metadata: {
                bookingId: booking.id,
                transactionId: payment.transactionId
            }
        }
    });
    await prisma_1.prisma.payment.update({
        where: { id: payment.id },
        data: {
            paymentIntentId: session.id,
        },
    });
    res.json({ url: session.url });
};
/* Stripe webhook */
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        return res.status(400).send("Missing Stripe signature");
    }
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, config_1.default.Stripe_Secret_webhook);
    }
    catch (err) {
        console.error("Webhook verification failed", err);
        return res.status(400).send("Webhook error");
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;
        await prisma_1.prisma.payment.update({
            where: { bookingId },
            data: {
                status: client_1.PaymentStatus.PAID,
                paymentIntentId: session.payment_intent,
                paidAt: new Date()
            },
        });
        await prisma_1.prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" }
        });
    }
    if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;
        await prisma_1.prisma.payment.update({
            where: { bookingId },
            data: {
                status: client_1.PaymentStatus.FAILED
            },
        });
    }
    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object.payment_details?.order_reference;
        await prisma_1.prisma.payment.updateMany({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                status: client_1.PaymentStatus.FAILED
            },
        });
    }
    res.json({ received: true });
};
exports.handleStripeWebhook = handleStripeWebhook;
exports.paymentController = {
    createStripeIntent,
    createCheckoutSession
};
