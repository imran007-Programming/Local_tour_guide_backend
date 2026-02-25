
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { paymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../error/ApiError";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "@prisma/client";


const createStripeIntent = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentService.createStripeIntent(
        req.user!,
        req.body.bookingId
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Stripe payment intent created",
        data: result
    });
});




const createCheckoutSession = async (req: Request, res: Response) => {
    const { bookingId, successUrl, cancelUrl } = req.body;

    // 1. find booking
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }
    const payment = await prisma.payment.findUnique({
        where: { bookingId },
    });

    if (!payment) {
        throw new ApiError(404, "payment not found");
    }
    const session = await stripe.checkout.sessions.create({
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
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            paymentIntentId: session.id,
        },
    });


    res.json({ url: session.url });
};

/* Stripe webhook */
export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    if (!sig) {
        return res.status(400).send("Missing Stripe signature");
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            config.Stripe_Secret_webhook!
        );
    } catch (err) {
        console.error("Webhook verification failed", err);
        return res.status(400).send("Webhook error");
    }





    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        const bookingId = session.metadata.bookingId;

        await prisma.payment.update({
            where: { bookingId },
            data: {
                status: PaymentStatus.PAID,
                paymentIntentId: session.payment_intent,
                paidAt: new Date()
            },
        });

        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" as any }
        });
    }

    if (event.type === "checkout.session.expired") {

        const session = event.data.object as any;
        const bookingId = session.metadata.bookingId;

        await prisma.payment.update({
            where: { bookingId },
            data: {
                status: PaymentStatus.FAILED
            },
        });
    }

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object.payment_details?.order_reference as any;

        await prisma.payment.updateMany({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                status: PaymentStatus.FAILED
            },
        });
    }


    res.json({ received: true });
};


export const paymentController = {
    createStripeIntent,
    createCheckoutSession
};
