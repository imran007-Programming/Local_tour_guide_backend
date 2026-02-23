import { Request, Response } from "express"
import { fileUploader } from "../../helper/fileUploader"
import { prisma } from "../../lib/prisma";
import { TUser } from "./user.interface";
import { IUser } from "../../../types/user.interface";
import { Prisma, User } from "@prisma/client";
import { paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";

const getAllfromDB = async (options: any, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.UserWhereInput[] = [];
    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map((field) => ({
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

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {}

    const result = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    })

    const total = await prisma.user.count({
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

const getSingleUserfromDB = async (id: string) => {

    return await prisma.user.findUnique({
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

}
const updateUser = async (req: Request) => {
    const userId = req.user.userId
    const payload = req.body



    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file);
        payload.profilePic = uploadResult?.secure_url;
    }


    return prisma.user.update({
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

    })



}


export const userService = {

    getAllfromDB,
    getSingleUserfromDB,
    updateUser
}