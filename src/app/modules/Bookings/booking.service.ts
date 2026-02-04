import httpStatus from 'http-status';
import { Request, Response } from "express"
import { ICreateBookingPayload } from "./booking.interface"
import { IUser } from "../../../types/user.interface"
import { BookingStatus, Prisma, Role } from "@prisma/client"
import ApiError from "../../error/ApiError"
import { prisma } from '../../lib/prisma';
import { Ioptions, paginationHelper } from '../../helper/paginationHelper';
import { bookingSearchableFields } from './booking.contant';

const createBooking = async (user: IUser, payload: ICreateBookingPayload) => {

    const tour = await prisma.tour.findUnique({
        where: {
            id: payload.tourId
        }
    })

    if (!tour || !tour.isActive) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not available")
    }

    //    Prevent double booking
    const existingTour = await prisma.booking.findFirst({
        where: {
            id: tour.guideId,
            requestDate: new Date(payload.requestDate),
            requestTime: payload.requestTime,
            status: {
                in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
            }

        }
    })
    if (existingTour) {
        throw new ApiError(httpStatus.CONFLICT, "This time slot is Booked")
    }
    const tourist = await prisma.tourist.findUnique({
        where: {
            userId: user.userId
        }
    })


    if (!tourist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Tourist profile not found")
    }

    return await prisma.booking.create({
        data: {
            touristId: tourist.id,
            tourId: tour.id,
            guideId: tour.guideId,
            requestDate: new Date(payload.requestDate),
            requestTime: payload.requestTime,
            message: payload.message,
            status: BookingStatus.PENDING

        }
    })

}
const getMyBooking = async (user: IUser) => {

    const tourist = await prisma.tourist.findUnique({
        where: {
            userId: user.userId
        }
    })

    if (!tourist) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found")
    }
    return await prisma.booking.findMany({
        where: {
            touristId: tourist.id,

        }, include: {
            tour: true,
            guide: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            profilePic: true,
                            role: true,

                        }
                    }
                }
            }, reviews: true, payment: true
        },
        orderBy: { createdAt: "desc" }
    })

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

    if (user.role !== Role.GUIDE) {
        throw new ApiError(httpStatus.NOT_FOUND, "Only guides can respond to bookings")
    }

    // only allow the valid status trasition//
    //Like if the status is alredy confirm or cancel it will not be changed
    if (![BookingStatus.CONFIRMED, BookingStatus.COMPLETED].includes(payload.status)) {
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

    if (booking.status !== BookingStatus.PENDING) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Booking has already been processed")
    }

    return await prisma.booking.update({
        where: {
            id: booking.id
        }, data: {
            status: payload.status
        }
    })

}


export const bookingService = {
    createBooking,
    getMyBooking,
    cancelBooking,
    getAssignedBooking,
    updateBookingStatus,
    completedBooking
}