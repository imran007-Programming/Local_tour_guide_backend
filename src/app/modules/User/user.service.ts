import { Request, Response } from "express"
import { fileUploader } from "../../helper/fileUploader"
import { prisma } from "../../lib/prisma";
import { TUser } from "./user.interface";
import { IUser } from "../../../types/user.interface";

const getAllfromDB = async (req: Request) => {
    const result = await prisma.user.findMany()
    return result
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