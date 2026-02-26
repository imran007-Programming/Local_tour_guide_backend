"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.touristService = void 0;
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const getAllFromDB = async (req) => {
    const result = await prisma_1.prisma.user.findMany({
        where: {
            role: client_1.Role.TOURIST
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
const getSingleFromDB = async (id) => {
    const result = await prisma_1.prisma.user.findFirst({
        where: {
            id,
            role: client_1.Role.TOURIST
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
const updateSingleFromDB = async (userId, payload) => {
    return await prisma_1.prisma.tourist.update({
        where: {
            userId
        },
        data: {
            ...(payload.preferences && { preferences: payload.preferences }),
        }
    });
};
exports.touristService = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
