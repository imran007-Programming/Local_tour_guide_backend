"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = void 0;
const prisma_1 = require("../../lib/prisma");
const addToWishlist = async (userId, tourId) => {
    const tourist = await prisma_1.prisma.tourist.findUnique({ where: { userId } });
    if (!tourist)
        throw new Error("Tourist not found");
    return await prisma_1.prisma.wishlist.create({
        data: { touristId: tourist.id, tourId }
    });
};
const removeFromWishlist = async (userId, tourId) => {
    const tourist = await prisma_1.prisma.tourist.findUnique({ where: { userId } });
    if (!tourist)
        throw new Error("Tourist not found");
    return await prisma_1.prisma.wishlist.delete({
        where: { touristId_tourId: { touristId: tourist.id, tourId } }
    });
};
const getWishlist = async (userId) => {
    const tourist = await prisma_1.prisma.tourist.findUnique({ where: { userId } });
    if (!tourist)
        throw new Error("Tourist not found");
    return await prisma_1.prisma.wishlist.findMany({
        where: { touristId: tourist.id },
        include: { tour: true }
    });
};
exports.wishlistService = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
