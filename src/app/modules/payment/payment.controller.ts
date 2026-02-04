
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
        console.log(session.metadata)
        const bookingId = session.metadata.bookingId;

        await prisma.payment.update({
            where: { bookingId },
            data: {
                status: PaymentStatus.PAID,
                paymentIntentId: session.payment_intent,
            },
        });
    }


    res.json({ received: true });
};


const createCheckoutSession = async (req: Request, res: Response) => {
    const { bookingId } = req.body;

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
        success_url: "https://www.programming-hero.com",
        cancel_url: "https://mail.google.com/mail/u/0/",
        metadata: {
            bookingId: booking.id,
        },
    });
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            paymentIntentId: session.id,
        },
    });


    res.json({ url: session.url });
};


export const paymentController = {
    createStripeIntent,
    createCheckoutSession
};
