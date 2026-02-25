import httpStatus from 'http-status';
import ApiError from "../../error/ApiError"
import { prisma } from "../../lib/prisma"
import { TCreateTourPayload } from "./tour.interface"
import { Request } from 'express';
import { fileUploader } from '../../helper/fileUploader';
import { paginationHelper } from '../../helper/paginationHelper';
import { Prisma } from '@prisma/client';
import { tourSearchableFields } from './tour.constant';

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

    return prisma.tour.create({
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
    });

}
const getAllTour = async (options: any, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, maxPrice, minPrice, guest, duration, ...filterData } = filters;

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



    const result = await prisma.tour.findMany({
        where: {
            AND: whereConditions,
            isActive: true
        },

        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },

    })
    const total = await prisma.tour.count({
        where: whereConditions
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
    return categories.map(c => c.category)
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