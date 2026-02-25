import { prisma } from "../../lib/prisma";

const addToWishlist = async (userId: string, tourId: string) => {
    const tourist = await prisma.tourist.findUnique({ where: { userId } });
    if (!tourist) throw new Error("Tourist not found");

    return await prisma.wishlist.create({
        data: { touristId: tourist.id, tourId }
    });
};

const removeFromWishlist = async (userId: string, tourId: string) => {
    const tourist = await prisma.tourist.findUnique({ where: { userId } });
    if (!tourist) throw new Error("Tourist not found");

    return await prisma.wishlist.delete({
        where: { touristId_tourId: { touristId: tourist.id, tourId } }
    });
};

const getWishlist = async (userId: string) => {
    const tourist = await prisma.tourist.findUnique({ where: { userId } });
    if (!tourist) throw new Error("Tourist not found");

    return await prisma.wishlist.findMany({
        where: { touristId: tourist.id },
        include: { tour: true }
    });
};

export const wishlistService = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
