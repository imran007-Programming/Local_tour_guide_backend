"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const fileUploader_1 = require("../../helper/fileUploader");
const prisma_1 = require("../../lib/prisma");
const paginationHelper_1 = require("../../helper/paginationHelper");
const user_constant_1 = require("./user.constant");
const getAllfromDB = async (options, filters) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma_1.prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma_1.prisma.user.count({
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
const getSingleUserfromDB = async (id) => {
    return await prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            profilePic: true,
            bio: true,
            role: true,
            languages: true,
            guide: {
                select: {
                    expertise: true,
                    dailyRate: true,
                },
            },
            tourist: {
                select: {
                    preferences: true,
                },
            },
        },
    });
};
const updateUser = async (req) => {
    const userId = req.user.userId;
    const payload = req.body;
    if (req.file) {
        const uploadResult = await fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        payload.profilePic = uploadResult?.secure_url;
    }
    return prisma_1.prisma.user.update({
        where: {
            id: userId
        },
        data: {
            ...(payload.name && { name: payload.name }),
            ...(payload.bio && { bio: payload.bio }),
            ...(payload.languages && { languages: payload.languages }),
            ...(payload.profilePic && { profilePic: payload.profilePic }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePic: true,
            bio: true,
            languages: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.userService = {
    getAllfromDB,
    getSingleUserfromDB,
    updateUser
};
