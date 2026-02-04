import httpStatus from 'http-status';
import { BookingStatus, Role } from "@prisma/client"
import { IUser } from "../../../types/user.interface"
import ApiError from "../../error/ApiError"
import { prisma } from '../../lib/prisma';

const createReview = async (user: IUser, payload: any) => {
    const { bookingId, rating, comment } = payload;

    if (user.role !== Role.TOURIST) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only Tourist can make Review")
    }
    const tourist = await prisma.tourist.findUnique({
        where: {
            userId: user.userId
        }

    })

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })
    if (!booking || booking.touristId !== tourist?.id) {
        throw new ApiError(httpStatus.NOT_FOUND, "booking not found")
    }
    if (booking.status !== BookingStatus.COMPLETED) {
        throw new ApiError(400, "Booking not completed")
    }

    const existingReview = await prisma.review.findUnique({
        where: { bookingId: booking?.id }
    });
    return await prisma.review.create({
        data: {
            bookingId: booking.id,
            touristId: tourist.id,
            guideId: booking.guideId,
            comment: comment,
            rating: rating
        }
    })

}

export const reviewService = {
    createReview
}