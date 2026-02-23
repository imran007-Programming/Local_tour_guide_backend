import httpStatus from 'http-status';
import { Request, Response } from "express"
import { ICreateBookingPayload } from "./booking.interface"
import { IUser } from "../../../types/user.interface"
import { BookingStatus, Prisma, Role } from "@prisma/client"
import ApiError from "../../error/ApiError"
import { prisma } from '../../lib/prisma';
import { Ioptions, paginationHelper } from '../../helper/paginationHelper';
import { bookingSearchableFields } from './booking.contant';

const createBooking = async (
    user: IUser,
    payload: ICreateBookingPayload
) => {
    return await prisma.$transaction(async (tx) => {

        const tour = await tx.tour.findUnique({
            where: { id: payload.tourId },
        });

        if (!tour || !tour.isActive) {
            throw new ApiError(404, "Tour not available");
        }

        const tourist = await tx.tourist.findUnique({
            where: { userId: user.userId },
        });

        if (!tourist) {
            throw new ApiError(400, "Tourist profile not found");
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
            throw new ApiError(
                400,
                "This time slot is fully booked"
            );
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
        } catch (error: any) {
            //  Catch unique constraint
            if (error.code === "P2002") {
                throw new ApiError(
                    409,
                    "This slot is already booked"
                );
            }
            throw error;
        }
    });
};
const getMyBooking = async (user: IUser, options: Ioptions, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = filters;

    const tourist = await prisma.tourist.findUnique({
        where: {
            userId: user.userId
        }
    })

    if (!tourist) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found")
    }

    const andConditions: Prisma.BookingWhereInput[] = [];
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
                equals: (filterData as any)[key]
            }
        }))
        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.BookingWhereInput = {
        touristId: tourist.id,
        ...(andConditions.length > 0 && { AND: andConditions })
    }

    const result = await prisma.booking.findMany({
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
    })

    const total = await prisma.booking.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }

}

const getAssignedBooking = async (options: Ioptions, filters: any, req: Request, user: IUser) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.BookingWhereInput[] = [];
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
                equals: (filterData as any)[key]
            }
        }))
        andConditions.push(...filterConditions)
    }




    const guide = await prisma.guide.findUnique({
        where: {
            userId: user.userId,
        }
    })
    if (!guide) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile not found");
    }
    const whereConditions: Prisma.BookingWhereInput = {
        guideId: guide.id,
        ...(andConditions.length > 0 && { AND: andConditions })
    }

    const result = await prisma.booking.findMany({
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

    })
    const total = await prisma.booking.count({
        where: {
            guideId: guide.id,
            AND: whereConditions
        }
    })
    return {
        meta: {
            total,
            page,
            limit,

        },
        data: result
    }

}


const cancelBooking = async (user: IUser, payload: any, bookingId: string) => {

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

    return await prisma.booking.update({
        where: {
            id: bookingId
        }, data: {
            status: BookingStatus.CANCELLED,
            cancelReason: payload.cancelReason
        }
    })




}




// update the status---> (complete by guide)
const completedBooking = async (user: IUser, bookingId: any) => {
    const userId = user.userId
    if (user.role !== Role.GUIDE) {
        throw new ApiError(httpStatus.NOT_FOUND, "guide not found")
    }
    const guide = await prisma.guide.findUnique({
        where: {
            userId
        }
    })
    if (!guide) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile not found");
    }
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })

    if (!booking || booking.guideId !== guide.id) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only confirm booking status can be changed")
    }

    return await prisma.booking.update({
        where: {
            id: booking.id
        }, data: {
            status: BookingStatus.COMPLETED
        }
    })

}

// update the booking status (CONFIRM/CANCEL)  --->(by guide)
const updateBookingStatus = async (user: IUser, bookingId: any, payload: any) => {
    const userId = user.userId
    console.log(payload)

    if (user.role !== Role.GUIDE) {
        throw new ApiError(httpStatus.NOT_FOUND, "Only guides can respond to bookings")
    }

    // only allow the valid status trasition//
    //Like if the status is alredy confirm or cancel it will not be changed
    if (![BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(payload.status)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Invalid booking response status"
        );
    }

    const guide = await prisma.guide.findUnique({
        where: {
            userId
        }
    })

    if (!guide) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile not found");
    }
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })

    if (!booking || booking.guideId !== guide.id) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
    }
    if (booking.status === BookingStatus.COMPLETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Booking is already completed")
    }
    if (booking.status === BookingStatus.CANCELLED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Booking is already cancel")
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only pending or confirmed bookings can be updated")
    }


    return await prisma.booking.update({
        where: {
            id: booking.id
        }, data: {
            status: payload.status
        }
    })

}

const getAdminStats = async () => {
    const totalBookings = await prisma.booking.count()
    const payments = await prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true }
    })
    const totalAmount = payments._sum.amount || 0
    const averageValue = totalBookings > 0 ? totalAmount / totalBookings : 0

    const statusBreakdown = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
    })
    const statusCounts = statusBreakdown.reduce((acc: any, item) => {
        acc[item.status] = item._count.id
        return acc
    }, {})

    const chartData = await prisma.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
    })

    const monthlyData = chartData.reduce((acc: any, item) => {
        const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' })
        if (!acc[month]) acc[month] = 0
        acc[month] += item._count.id
        return acc
    }, {})

    return { totalBookings, totalAmount, averageValue, chartData: monthlyData, statusBreakdown: statusCounts }
}

const getGuideStats = async (user: IUser) => {
    const guide = await prisma.guide.findUnique({ where: { userId: user.userId } })
    if (!guide) throw new ApiError(httpStatus.NOT_FOUND, "Guide not found")

    const totalBookings = await prisma.booking.count({ where: { guideId: guide.id } })
    const payments = await prisma.payment.aggregate({
        where: {
            booking: { guideId: guide.id },
            status: "PAID"
        },
        _sum: { amount: true }
    })
    const totalAmount = payments._sum.amount || 0
    const averageValue = totalBookings > 0 ? totalAmount / totalBookings : 0

    const statusBreakdown = await prisma.booking.groupBy({
        by: ['status'],
        where: { guideId: guide.id },
        _count: { id: true }
    })
    const statusCounts = statusBreakdown.reduce((acc: any, item) => {
        acc[item.status] = item._count.id
        return acc
    }, {})

    const chartData = await prisma.booking.groupBy({
        by: ['createdAt'],
        where: { guideId: guide.id },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
    })

    const monthlyData = chartData.reduce((acc: any, item) => {
        const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' })
        if (!acc[month]) acc[month] = 0
        acc[month] += item._count.id
        return acc
    }, {})

    return { totalBookings, totalAmount, averageValue, chartData: monthlyData, statusBreakdown: statusCounts }
}

const getTouristStats = async (user: IUser) => {
    const tourist = await prisma.tourist.findUnique({ where: { userId: user.userId } })
    if (!tourist) throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found")

    const totalBookings = await prisma.booking.count({ where: { touristId: tourist.id } })
    const payments = await prisma.payment.aggregate({
        where: {
            booking: { touristId: tourist.id },
            status: "PAID"
        },
        _sum: { amount: true }
    })
    const totalAmount = payments._sum.amount || 0
    const averageValue = totalBookings > 0 ? totalAmount / totalBookings : 0

    const statusBreakdown = await prisma.booking.groupBy({
        by: ['status'],
        where: { touristId: tourist.id },
        _count: { id: true }
    })
    const statusCounts = statusBreakdown.reduce((acc: any, item) => {
        acc[item.status] = item._count.id
        return acc
    }, {})

    const chartData = await prisma.booking.groupBy({
        by: ['createdAt'],
        where: { touristId: tourist.id },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
    })

    const monthlyData = chartData.reduce((acc: any, item) => {
        const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' })
        if (!acc[month]) acc[month] = 0
        acc[month] += item._count.id
        return acc
    }, {})

    return { totalBookings, totalAmount, averageValue, chartData: monthlyData, statusBreakdown: statusCounts }
}

const getAllBookings = async (options: Ioptions, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = filters;
    const andConditions: Prisma.BookingWhereInput[] = [];

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
            [key]: { equals: (filterData as any)[key] }
        })))
    }

    const whereConditions: Prisma.BookingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {}

    const result = await prisma.booking.findMany({
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
    })

    const total = await prisma.booking.count({ where: whereConditions })

    return {
        meta: { total, page, limit },
        data: result
    }
}


export const bookingService = {
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
}