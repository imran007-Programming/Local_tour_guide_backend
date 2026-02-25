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

    try {
        return await prisma.review.create({
            data: {
                bookingId: booking.id,
                touristId: tourist.id,
                guideId: booking.guideId,
                comment: comment,
                rating: rating
            }
        })
    } catch (error: any) {
        if (error.code === "P2002") {
            throw new ApiError(
                409,
                "you have already given review"
            );
        }
        throw error
    }


}

const getAllReviews = async () => {
    return await prisma.review.findMany({
        include: {
            tourist: { include: { user: true } },
            guide: { include: { user: true } },
            booking: { include: { tour: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

const getTourReviews = async (tourId: string) => {
    return await prisma.review.findMany({
        where: {
            booking: { tourId }
        },
        include: {
            tourist: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

const getGuideReviews = async (guideId: string) => {
    return await prisma.review.findMany({
        where: { guideId },
        include: {
            tourist: { include: { user: true } },
            booking: { include: { tour: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

const getMyReviews = async (user: IUser) => {
    const tourist = await prisma.tourist.findUnique({
        where: { userId: user.userId }
    })
    if (!tourist) throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found")

    return await prisma.review.findMany({
        where: { touristId: tourist.id },
        include: {
            guide: { include: { user: true } },
            booking: { include: { tour: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

const updateReview = async (user: IUser, id: string, payload: any) => {
    const tourist = await prisma.tourist.findUnique({
        where: { userId: user.userId }
    })
    if (!tourist) throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found")

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review || review.touristId !== tourist.id) {
        throw new ApiError(httpStatus.NOT_FOUND, "Review not found")
    }

    return await prisma.review.update({
        where: { id },
        data: {
            ...(payload.rating && { rating: payload.rating }),
            ...(payload.comment && { comment: payload.comment })
        }
    })
}

const deleteReview = async (user: IUser, id: string) => {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new ApiError(httpStatus.NOT_FOUND, "Review not found")

    if (user.role !== Role.ADMIN) {
        const tourist = await prisma.tourist.findUnique({
            where: { userId: user.userId }
        })
        if (!tourist || review.touristId !== tourist.id) {
            throw new ApiError(httpStatus.FORBIDDEN, "Not authorized")
        }
    }

    return await prisma.review.delete({ where: { id } })
}

export const reviewService = {
    createReview,
    getAllReviews,
    getTourReviews,
    getGuideReviews,
    getMyReviews,
    updateReview,
    deleteReview
}