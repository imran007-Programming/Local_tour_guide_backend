import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { IUser } from "../../../types/user.interface";


const createStripeIntent = async (
    user: IUser,
    bookingId: string
) => {

    if (user.role !== Role.TOURIST) {
        throw new ApiError(403, "Only tourists can pay");
    }

    const tourist = await prisma.tourist.findUnique({
        where: { userId: user.userId }
    });

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });


    if (!booking || booking.touristId !== tourist?.id) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.status !== BookingStatus.PENDING) {
        throw new ApiError(400, "Booking must be in pending status to make payment");
    }

    let payment = await prisma.payment.findUnique({
        where: { bookingId }
    });
    if (payment?.status === PaymentStatus.PAID) {
        throw new ApiError(400, "You already paid for this tour");
    }
    const tour = await prisma.tour.findUnique({
        where: {
            id: booking?.tourId
        }
    })


    if (!payment) {
        payment = await prisma.payment.create({
            data: {
                bookingId,
                amount: tour?.price!,
                status: PaymentStatus.PENDING
            }
        });
    }

    const paymentIntent = await stripe.paymentIntents.create({
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

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            paymentIntentId: paymentIntent.id
        }
    });

    return {
        clientSecret: paymentIntent.client_secret
    };
};

const handleWebhook = async (event: any) => {
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { bookingId, paymentId } = paymentIntent.metadata;

        await prisma.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.PAID }
        });

        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CONFIRMED }
        });
    }
};






export const paymentService = {
    createStripeIntent,
    handleWebhook
}