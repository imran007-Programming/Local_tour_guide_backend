"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const wishlist_service_1 = require("./wishlist.service");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const addToWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const { tourId } = req.body;
    const result = await wishlist_service_1.wishlistService.addToWishlist(userId, tourId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Tour added to wishlist",
        data: result,
    });
});
const removeFromWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const tourId = req.params.tourId;
    await wishlist_service_1.wishlistService.removeFromWishlist(userId, tourId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tour removed from wishlist",
        data: null,
    });
});
const getWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const result = await wishlist_service_1.wishlistService.getWishlist(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Wishlist retrieved successfully",
        data: result,
    });
});
exports.wishlistController = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
