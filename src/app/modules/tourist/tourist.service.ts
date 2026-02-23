import { Request } from "express";
import { prisma } from "../../lib/prisma";
import { Role, User } from "@prisma/client";
import { TUpdateTouristPayload } from "./tourist.interface";

const getAllFromDB = async (req: Request) => {
    const result = await prisma.user.findMany({
        where: {
            role: Role.TOURIST
        },
        select: {
            id: true,
            email: true,
            name: true,
            profilePic: true,
            bio: true,
            languages: true,

            tourist: {
                select: {
                    id: true,
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
            role: Role.TOURIST
        },
        select: {
            id: true,
            name: true,
            profilePic: true,
            bio: true,
            languages: true,

            tourist: {
                select: {
                    id: true,
                },
            },
        },
    });

    return result;
};

const updateSingleFromDB = async (userId: string, payload: TUpdateTouristPayload) => {

    return await prisma.tourist.update({
        where: {
            userId
        },
        data: {
            ...(payload.preferences && { preferences: payload.preferences }),
        }
    })
};
export const touristService = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
