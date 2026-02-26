"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideService = void 0;
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../helper/paginationHelper");
const guide_constant_1 = require("./guide.constant");
const getAllFromDB = async (options, filters) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, expertise, dailyRate, minRating, ...filterData } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: guide_constant_1.guideSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }
    if (expertise) {
        andConditions.push({
            guide: {
                expertise: {
                    has: expertise
                }
            }
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
        role: client_1.Role.GUIDE,
        ...(andConditions.length > 0 && { AND: andConditions })
    };
    let orderBy;
    if (sortBy === 'dailyRate') {
        orderBy = { guide: { dailyRate: sortOrder } };
    }
    const result = await prisma_1.prisma.user.findMany({
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
        if (!user.guide)
            return user;
        const totalReviews = user.guide._count.reviews || 0;
        const averageRating = totalReviews > 0
            ? user.guide.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        return {
            ...user,
            guide: {
                ...user.guide,
                totalReviews,
                averageRating: Number(averageRating.toFixed(1)),
                reviews: undefined
            }
        };
    });
    const filteredData = minRating
        ? dataWithRatings.filter(user => user.guide && 'averageRating' in user.guide && user.guide.averageRating >= Number(minRating))
        : dataWithRatings;
    const total = await prisma_1.prisma.user.count({
        where: whereConditions
    });
    return {
        meta: {
            total: filteredData.length,
            page,
            limit
        },
        data: filteredData
    };
};
const getSingleFromDB = async (id) => {
    const result = await prisma_1.prisma.user.findFirst({
        where: {
            id,
            role: client_1.Role.GUIDE
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
const updateSingleFromDB = async (userId, payload) => {
    return await prisma_1.prisma.guide.update({
        where: {
            userId
        },
        data: {
            ...(payload.expertise && { expertise: payload.expertise }),
            ...(payload.dailyRate && { dailyRate: payload.dailyRate })
        }
    });
};
exports.guideService = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
