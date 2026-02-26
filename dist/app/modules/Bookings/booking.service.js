"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const prisma_1 = require("../../lib/prisma");
const paginationHelper_1 = require("../../helper/paginationHelper");
const createBooking = async (user, payload) => {
    return await prisma_1.prisma.$transaction(async (tx) => {
        const tour = await tx.tour.findUnique({
            where: { id: payload.tourId },
        });
        if (!tour || !tour.isActive) {
            throw new ApiError_1.default(404, "Tour not available");
        }
        const tourist = await tx.tourist.findUnique({
            where: { userId: user.userId },
        });
        if (!tourist) {
            throw new ApiError_1.default(400, "Tourist profile not found");
        }
        const bookingDateTime = new Date(payload.bookingDateTime);
        // 1️⃣ Check slot capacity
        const activeBookingsCount = await tx.booking.count({
            where: {
                tourId: payload.tourId,
                bookingDateTime,
                status: {
                    in: ["PENDING", "CONFIRMED"],
                },
            },
        });
        if (activeBookingsCount >= tour.maxGroupSize) {
            throw new ApiError_1.default(400, "This time slot is fully booked");
        }
        try {
            return await tx.booking.create({
                data: {
                    touristId: tourist.id,
                    guideId: tour.guideId,
                    tourId: tour.id,
                    bookingDateTime,
                    message: payload.message,
                    status: "PENDING",
                },
            });
        }
        catch (error) {
            //  Catch unique constraint
            if (error.code === "P2002") {
                throw new ApiError_1.default(409, "This time or date slot is already booked");
            }
            throw error;
        }
    });
};
const getMyBooking = async (user, options, filters) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: {
            userId: user.userId
        }
    });
    if (!tourist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Tourist not found");
    }
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [
                {
                    tour: {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive"
                        }
                    }
                },
                {
                    guide: {
                        user: {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    }
                }
            ]
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key]
            }
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = {
        touristId: tourist.id,
        ...(andConditions.length > 0 && { AND: andConditions })
    };
    const result = await prisma_1.prisma.booking.findMany({
        where: whereConditions,
        include: {
            tour: true,
            guide: {
                include: {
                    user: true
                }
            }, reviews: true, payment: true
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
    });
    const total = await prisma_1.prisma.booking.count({
        where: whereConditions
    });
    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};
const getAssignedBooking = async (options, filters, req, user) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [
                {
                    tour: {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive"
                        }
                    }
                },
                {
                    tourist: {
                        user: {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    }
                },
                {
                    tourist: {
                        user: {
                            email: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    },
                }
            ]
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key]
            }
        }));
        andConditions.push(...filterConditions);
    }
    const guide = await prisma_1.prisma.guide.findUnique({
        where: {
            userId: user.userId,
        }
    });
    if (!guide) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Guide profile not found");
    }
    const whereConditions = {
        guideId: guide.id,
        ...(andConditions.length > 0 && { AND: andConditions })
    };
    const result = await prisma_1.prisma.booking.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            tour: true,
            payment: true,
            tourist: {
                include: {
                    user: true
                }
            },
            reviews: true
        },
    });
    const total = await prisma_1.prisma.booking.count({
        where: {
            guideId: guide.id,
            AND: whereConditions
        }
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result
    };
};
const cancelBooking = async (user, payload, bookingId) => {
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
    return await prisma_1.prisma.booking.update({
        where: {
            id: bookingId
        }, data: {
            status: client_1.BookingStatus.CANCELLED,
            cancelReason: payload.cancelReason
        }
    });
};
// update the status---> (complete by guide)
const completedBooking = async (user, bookingId) => {
    const userId = user.userId;
    if (user.role !== client_1.Role.GUIDE) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "guide not found");
    }
    const guide = await prisma_1.prisma.guide.findUnique({
        where: {
            userId
        }
    });
    if (!guide) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Guide profile not found");
    }
    const booking = await prisma_1.prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    });
    if (!booking || booking.guideId !== guide.id) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Booking not found");
    }
    if (booking.status !== client_1.BookingStatus.CONFIRMED) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only confirm booking status can be changed");
    }
    return await prisma_1.prisma.booking.update({
        where: {
            id: booking.id
        }, data: {
            status: client_1.BookingStatus.COMPLETED
        }
    });
};
// update the booking status (CONFIRM/CANCEL)  --->(by guide)
const updateBookingStatus = async (user, bookingId, payload) => {
    const userId = user.userId;
    if (user.role !== client_1.Role.GUIDE) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Only guides can respond to bookings");
    }
    // only allow the valid status trasition//
    //Like if the status is alredy confirm or cancel it will not be changed
    if (![client_1.BookingStatus.COMPLETED, client_1.BookingStatus.CANCELLED].includes(payload.status)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid booking response status");
    }
    const guide = await prisma_1.prisma.guide.findUnique({
        where: {
            userId
        }
    });
    if (!guide) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Guide profile not found");
    }
    const booking = await prisma_1.prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    });
    if (!booking || booking.guideId !== guide.id) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Booking not found");
    }
    if (booking.status === client_1.BookingStatus.COMPLETED) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Booking is already completed");
    }
    if (booking.status === client_1.BookingStatus.CANCELLED) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Booking is already cancel");
    }
    if (booking.status !== client_1.BookingStatus.CONFIRMED && booking.status !== client_1.BookingStatus.PENDING) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Only pending or confirmed bookings can be updated");
    }
    return await prisma_1.prisma.booking.update({
        where: {
            id: booking.id
        }, data: {
            status: payload.status
        }
    });
};
const getAdminStats = async () => {
    const totalBookings = await prisma_1.prisma.booking.count();
    const payments = await prisma_1.prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true }
    });
    const totalAmount = payments._sum.amount || 0;
    const averageValue = totalBookings > 0 ? totalAmount / totalBookings : 0;
    const statusBreakdown = await prisma_1.prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    const statusCounts = statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
    }, {});
    const chartData = await prisma_1.prisma.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
    });
    const monthlyData = chartData.reduce((acc, item) => {
        const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' });
        if (!acc[month])
            acc[month] = 0;
        acc[month] += item._count.id;
        return acc;
    }, {});
    return { totalBookings, totalAmount, averageValue, chartData: monthlyData, statusBreakdown: statusCounts };
};
const getGuideStats = async (user) => {
    const guide = await prisma_1.prisma.guide.findUnique({ where: { userId: user.userId } });
    if (!guide)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Guide not found");
    const totalBookings = await prisma_1.prisma.booking.count({ where: { guideId: guide.id } });
    const payments = await prisma_1.prisma.payment.aggregate({
        where: {
            booking: { guideId: guide.id },
            status: "PAID"
        },
        _sum: { amount: true }
    });
    const totalAmount = payments._sum.amount || 0;
    const averageValue = totalBookings > 0 ? totalAmount / totalBookings : 0;
    const statusBreakdown = await prisma_1.prisma.booking.groupBy({
        by: ['status'],
        where: { guideId: guide.id },
        _count: { id: true }
    });
    const statusCounts = statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
    }, {});
    const chartData = await prisma_1.prisma.booking.groupBy({
        by: ['createdAt'],
        where: { guideId: guide.id },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
    });
    const monthlyData = chartData.reduce((acc, item) => {
        const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' });
        if (!acc[month])
            acc[month] = 0;
        acc[month] += item._count.id;
        return acc;
    }, {});
    return { totalBookings, totalAmount, averageValue, chartData: monthlyData, statusBreakdown: statusCounts };
};
const getTouristStats = async (user) => {
    const tourist = await prisma_1.prisma.tourist.findUnique({ where: { userId: user.userId } });
    if (!tourist)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Tourist not found");
    const totalBookings = await prisma_1.prisma.booking.count({ where: { touristId: tourist.id } });
    const payments = await prisma_1.prisma.payment.aggregate({
        where: {
            booking: { touristId: tourist.id },
            status: "PAID"
        },
        _sum: { amount: true }
    });
    const totalAmount = payments._sum.amount || 0;
    const averageValue = totalBookings > 0 ? totalAmount / totalBookings : 0;
    const statusBreakdown = await prisma_1.prisma.booking.groupBy({
        by: ['status'],
        where: { touristId: tourist.id },
        _count: { id: true }
    });
    const statusCounts = statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
    }, {});
    const chartData = await prisma_1.prisma.booking.groupBy({
        by: ['createdAt'],
        where: { touristId: tourist.id },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
    });
    const monthlyData = chartData.reduce((acc, item) => {
        const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' });
        if (!acc[month])
            acc[month] = 0;
        acc[month] += item._count.id;
        return acc;
    }, {});
    return { totalBookings, totalAmount, averageValue, chartData: monthlyData, statusBreakdown: statusCounts };
};
const getAllBookings = async (options, filters) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [
                { tour: { title: { contains: searchTerm, mode: "insensitive" } } },
                { tourist: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
                { guide: { user: { name: { contains: searchTerm, mode: "insensitive" } } } }
            ]
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push(...Object.keys(filterData).map((key) => ({
            [key]: { equals: filterData[key] }
        })));
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma_1.prisma.booking.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            tour: true,
            payment: true,
            tourist: { include: { user: true } },
            guide: { include: { user: true } },
            reviews: true
        }
    });
    const total = await prisma_1.prisma.booking.count({ where: whereConditions });
    return {
        meta: { total, page, limit },
        data: result
    };
};
exports.bookingService = {
    createBooking,
    getMyBooking,
    cancelBooking,
    getAssignedBooking,
    updateBookingStatus,
    completedBooking,
    getAdminStats,
    getGuideStats,
    getTouristStats,
    getAllBookings
};
