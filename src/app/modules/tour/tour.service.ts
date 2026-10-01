import httpStatus from 'http-status';
import ApiError from "../../error/ApiError"
import { prisma } from "../../lib/prisma"
import { TCreateTourPayload } from "./tour.interface"
import { Request } from 'express';
import { fileUploader } from '../../helper/fileUploader';
import { paginationHelper } from '../../helper/paginationHelper';
import { Prisma } from '@prisma/client';
import { tourSearchableFields } from './tour.constant';
import { notificationService } from '../notification/notification.service';

const createTour = async (req: Request & { user?: any }) => {
    const userId = req.user.userId
    const payload = req.body
    const imageUrlList: string[] = []

    if (typeof payload.languages === 'string') {
        payload.languages = JSON.parse(payload.languages)
    }

    if (req.files && Array.isArray(req.files)) {

        for (const file of req?.files) {
            const uploadResult = await fileUploader.uploadToCloudinary(file)
            imageUrlList.push(uploadResult.secure_url)
        }
    }

    const guide = await prisma.guide.findUnique({
        where: { userId }
    })

    if (!guide) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide profile not found")
    }
    if (!guide.id) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only guides can create tours")
    }

    const slug = payload.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const tour = await prisma.tour.create({
        data: {
            title: payload.title,
            slug,
            description: payload.description,
            price: payload.price,
            duration: payload.duration,
            meetingPoint: payload.meetingPoint,
            maxGroupSize: payload.maxGroupSize,
            images: imageUrlList,
            city: payload.city,
            guideId: guide.id,
            itinerary: payload.itinerary,
            category: payload.category,
            languages: payload.languages,
        },
        include: {
            guide: {
                include: {
                    user: true
                }
            }
        }
    });

    // Notify admins about new tour creation
    await notificationService.createAdminNotification('GENERAL', {
        type: 'TOUR_CREATED',
        title: tour.title,
        guideName: tour.guide.user.name,
        city: tour.city,
        price: tour.price
    });

    return tour;

}
const getAllTour = async (options: any, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, maxPrice, minPrice, guest, duration, category, ...filterData } = filters;

    const andConditions: Prisma.TourWhereInput[] = [];
    if (searchTerm) {
        andConditions.push({
            OR: tourSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }
    if (guest) {
        andConditions.push({
            maxGroupSize: {
                gte: Number(guest)
            }
        })
    }
    if (duration) {
        andConditions.push({
            duration: {
                gte: Number(duration)
            }
        })
    }
    // Category is free text, so match it ignoring case and stray spaces
    if (category) {
        andConditions.push({
            category: {
                equals: String(category).trim(),
                mode: "insensitive"
            }
        })
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))
        andConditions.push(...filterConditions)
    }
    // Filter by price Range
    if (maxPrice || minPrice) {
        const priceConditions: any = {}
        if (minPrice) priceConditions.gte = Number(minPrice);
        if (maxPrice) priceConditions.lte = Number(maxPrice)
        andConditions.push({ price: priceConditions })
    }

    const whereConditions: Prisma.TourWhereInput = andConditions?.length > 0 ? { AND: andConditions } : {}

    const [result, total] = await Promise.all([
        prisma.tour.findMany({
            where: {
                AND: whereConditions,
                isActive: true
            },
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
        }),
        prisma.tour.count({
            where: whereConditions
        }),
    ])

    // One query for every tour's reviews (instead of one query per tour)
    const reviews = await prisma.review.findMany({
        where: { booking: { tourId: { in: result.map((t) => t.id) } } },
        select: { rating: true, booking: { select: { tourId: true } } }
    })
    const ratingsByTour = new Map<string, number[]>()
    for (const r of reviews) {
        const list = ratingsByTour.get(r.booking.tourId) ?? []
        list.push(r.rating)
        ratingsByTour.set(r.booking.tourId, list)
    }

    const toursWithRatings = result.map((tour) => {
        const ratings = ratingsByTour.get(tour.id) ?? []
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0
        return {
            ...tour,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: ratings.length
        }
    })
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: toursWithRatings
    }
}
const getSingleTour = async (slug: string) => {
    return await prisma.tour.findUnique({
        where: { slug },
        include: {
            guide: {
                select: {
                    id: true,
                    expertise: true,
                    dailyRate: true,
                    user: true
                }
            }
        }
    })
}
const updateTour = async (tourId: string, payload: Partial<TCreateTourPayload>) => {

    return await prisma.tour.update({
        where: {
            id: tourId
        },
        data: payload
    })
}

const deleteTour = async (tourId: string) => {
    const bookings = await prisma.booking.count({
        where: { tourId },
    });

    if (bookings > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Cannot delete tour with existing bookings");
    }

    return await prisma.tour.delete({
        where: {
            id: tourId
        }

    })
}

const addTourImages = async (
    tourId: string,
    req: Request
) => {
    const uploadedImages: string[] = [];

    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            const result =
                await fileUploader.uploadToCloudinary(file);
            uploadedImages.push(result.secure_url);
        }
    }

    const existingTour = await prisma.tour.findUnique({
        where: { id: tourId },
    });

    if (!existingTour) {
        throw new Error("Tour not found");
    }

    return prisma.tour.update({
        where: { id: tourId },
        data: {
            images: [
                ...existingTour.images,
                ...uploadedImages,
            ],
        },
    });
};

const deleteTourImage = async (
    tourId: string,
    imageUrl: string
) => {
    const existingTour = await prisma.tour.findUnique({
        where: { id: tourId },
    });

    if (!existingTour) {
        throw new Error("Tour not found");
    }

    // Delete from Cloudinary
    await fileUploader.deleteFromCloudinary(imageUrl);

    const updatedImages = existingTour.images.filter(
        (img) => img !== imageUrl
    );

    return prisma.tour.update({
        where: { id: tourId },
        data: {
            images: updatedImages,
        },
    });
};

const getCategories = async () => {
    const categories = await prisma.tour.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category']
    })
    // "Food", "food" and "FOOD " are the same category: keep one entry per spelling
    const unique = new Map<string, string>()
    for (const { category } of categories) {
        const name = category.trim()
        if (name && !unique.has(name.toLowerCase())) unique.set(name.toLowerCase(), name)
    }
    return [...unique.values()].sort((a, b) => a.localeCompare(b))
}

export const tourService = {
    createTour,
    getAllTour,
    getSingleTour,
    updateTour,
    deleteTour,
    addTourImages,
    deleteTourImage,
    getCategories
}