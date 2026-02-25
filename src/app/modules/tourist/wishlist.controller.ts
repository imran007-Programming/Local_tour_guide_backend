import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { wishlistService } from "./wishlist.service";
import sendResponse from "../../shared/sendResponse";

const addToWishlist = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId;
    const { tourId } = req.body;

    const result = await wishlistService.addToWishlist(userId, tourId);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tour added to wishlist",
        data: result,
    });
});

const removeFromWishlist = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId;
    const tourId = req.params.tourId as string;

    await wishlistService.removeFromWishlist(userId, tourId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour removed from wishlist",
        data: null,
    });
});

const getWishlist = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId;

    const result = await wishlistService.getWishlist(userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Wishlist retrieved successfully",
        data: result,
    });
});

export const wishlistController = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
