"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const prisma_1 = require("../../lib/prisma");
const createReview = async (user, payload) => {
    const { bookingId, rating, comment } = payload;
    if (user.role !== client_1.Role.TOURIST) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only Tourist can make Review");
    }
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: {
            userId: user.userId
        }
    });
    const booking = await prisma_1.prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    });
    if (!booking || booking.touristId !== tourist?.id) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "booking not found");
    }
    if (booking.status !== client_1.BookingStatus.COMPLETED) {
        throw new ApiError_1.default(400, "Booking not completed");
    }
    const existingReview = await prisma_1.prisma.review.findUnique({
        where: { bookingId: booking?.id }
    });
    try {
        return await prisma_1.prisma.review.create({
            data: {
                bookingId: booking.id,
                touristId: tourist.id,
                guideId: booking.guideId,
                comment: comment,
                rating: rating
            }
        });
    }
    catch (error) {
        if (error.code === "P2002") {
            throw new ApiError_1.default(409, "you have already given review");
        }
        throw error;
    }
};
const getAllReviews = async () => {
    return await prisma_1.prisma.review.findMany({
        include: {
            tourist: { include: { user: true } },
            guide: { include: { user: true } },
            booking: { include: { tour: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
const getTourReviews = async (tourId) => {
    return await prisma_1.prisma.review.findMany({
        where: {
            booking: { tourId }
        },
        include: {
            tourist: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
const getGuideReviews = async (guideId) => {
    return await prisma_1.prisma.review.findMany({
        where: { guideId },
        include: {
            tourist: { include: { user: true } },
            booking: { include: { tour: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
const getMyReviews = async (user) => {
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: { userId: user.userId }
    });
    if (!tourist)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Tourist not found");
    return await prisma_1.prisma.review.findMany({
        where: { touristId: tourist.id },
        include: {
            guide: { include: { user: true } },
            booking: { include: { tour: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
const updateReview = async (user, id, payload) => {
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: { userId: user.userId }
    });
    if (!tourist)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Tourist not found");
    const review = await prisma_1.prisma.review.findUnique({ where: { id } });
    if (!review || review.touristId !== tourist.id) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Review not found");
    }
    return await prisma_1.prisma.review.update({
        where: { id },
        data: {
            ...(payload.rating && { rating: payload.rating }),
            ...(payload.comment && { comment: payload.comment })
        }
    });
};
const deleteReview = async (user, id) => {
    const review = await prisma_1.prisma.review.findUnique({ where: { id } });
    if (!review)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Review not found");
    if (user.role !== client_1.Role.ADMIN) {
        const tourist = await prisma_1.prisma.tourist.findUnique({
            where: { userId: user.userId }
        });
        if (!tourist || review.touristId !== tourist.id) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Not authorized");
        }
    }
    return await prisma_1.prisma.review.delete({ where: { id } });
};
exports.reviewService = {
    createReview,
    getAllReviews,
    getTourReviews,
    getGuideReviews,
    getMyReviews,
    updateReview,
    deleteReview
};
