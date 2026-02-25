import { Request } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { TUpdateGuidePayload } from "./guide.interface";
import { paginationHelper } from "../../helper/paginationHelper";
import { guideSearchableFields } from "./guide.constant";


const getAllFromDB = async (options: any, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, expertise, dailyRate, minRating, ...filterData } = filters;

    const andConditions: Prisma.UserWhereInput[] = [];
    if (searchTerm) {
        andConditions.push({
            OR: guideSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }
    if (expertise) {
        andConditions.push({
            guide: {
                expertise: {
                    has: expertise
                }
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

    const whereConditions: Prisma.UserWhereInput = {
        role: Role.GUIDE,
        ...(andConditions.length > 0 && { AND: andConditions })
    }


    let orderBy: any
    if (sortBy === 'dailyRate') {
        orderBy = { guide: { dailyRate: sortOrder } }
    }

    const result = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        select: {
            id: true,
            email: true,
            name: true,
            profilePic: true,
            bio: true,
            languages: true,

            guide: {
                select: {
                    id: true,
                    expertise: true,
                    dailyRate: true,
                    _count: {
                        select: { bookings: true, reviews: true }
                    },
                    reviews: {
                        select: { rating: true }
                    }
                },
            },
        },
    });

    const dataWithRatings = result.map(user => {
        if (!user.guide) return user

        const totalReviews = user.guide._count.reviews || 0
        const averageRating = totalReviews > 0
            ? user.guide.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0

        return {
            ...user,
            guide: {
                ...user.guide,
                totalReviews,
                averageRating: Number(averageRating.toFixed(1)),
                reviews: undefined
            }
        }
    })

    const filteredData = minRating
        ? dataWithRatings.filter(user => user.guide && 'averageRating' in user.guide && user.guide.averageRating >= Number(minRating))
        : dataWithRatings

    const total = await prisma.user.count({
        where: whereConditions
    })

    return {
        meta: {
            total: filteredData.length,
            page,
            limit
        },
        data: filteredData
    };
};


const getSingleFromDB = async (id: string) => {
    const result = await prisma.user.findFirst({
        where: {
            id,
            role: Role.GUIDE
        },
        select: {
            id: true,
            name: true,
            profilePic: true,
            bio: true,
            languages: true,

            guide: {
                select: {
                    expertise: true,
                    dailyRate: true,
                },
            },
        },
    });

    return result;
};

const updateSingleFromDB = async (userId: string, payload: TUpdateGuidePayload) => {

    return await prisma.guide.update({
        where: {
            userId
        },
        data: {
            ...(payload.expertise && { expertise: payload.expertise }),
            ...(payload.dailyRate && { dailyRate: payload.dailyRate })
        }
    })
};
export const guideService = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
