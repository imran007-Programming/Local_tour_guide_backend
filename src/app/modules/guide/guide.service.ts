import { Request } from "express";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { TUpdateGuidePayload } from "./guide.interface";

const getAllFromDB = async (req: Request) => {
    const result = await prisma.user.findMany({
        where: {
            role: Role.GUIDE
        },
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
                },
            },
        },
    });

    return result;
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
