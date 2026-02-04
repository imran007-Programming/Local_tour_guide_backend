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


    if (req.files && Array.isArray(req.files)) {

        for (const file of req?.files) {
            const uploadResult = await fileUploader.uploadToCloudinary(file)
            imageUrlList.push(uploadResult.secure_url)
        }
    }

    const guide = await prisma.guide.findUnique({
        where: { userId }
    })
    console.log(guide)
    if (!guide) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide profile not found")
    }
    if (!guide.id) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only guides can create tours")
    }
    return prisma.tour.create({
        data: {
            title: payload.title,
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
    const { searchTerm, maxPrice, minPrice, ...filterData } = filters;

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
        }
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
const updateTour = async (tourId: string, payload: Partial<TCreateTourPayload>) => {

    return await prisma.tour.update({
        where: {
            id: tourId
        },
        data: payload
    })
}

const deleteTour = async (tourId: string) => {

    return await prisma.tour.delete({
        where: {
            id: tourId
        }

    })
}

export const tourService = {
    createTour,
    getAllTour,
    updateTour,
    deleteTour
}