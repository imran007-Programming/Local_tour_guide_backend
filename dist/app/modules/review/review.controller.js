"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const review_service_1 = require("./review.service");
const createReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await review_service_1.reviewService.createReview(user, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Review added successfully",
        data: result
    });
});
const getAllReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await review_service_1.reviewService.getAllReviews();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reviews retrieved successfully",
        data: result
    });
});
const getTourReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const tourId = req.params.tourId;
    const result = await review_service_1.reviewService.getTourReviews(tourId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Tour reviews retrieved successfully",
        data: result
    });
});
const getGuideReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const guideId = req.params.guideId;
    const result = await review_service_1.reviewService.getGuideReviews(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Guide reviews retrieved successfully",
        data: result
    });
});
const getMyReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const result = await review_service_1.reviewService.getMyReviews(user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My reviews retrieved successfully",
        data: result
    });
});
const updateReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    const payload = req.body;
    const result = await review_service_1.reviewService.updateReview(user, id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Review updated successfully",
        data: result
    });
});
const deleteReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const id = req.params.id;
    const result = await review_service_1.reviewService.deleteReview(user, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Review deleted successfully",
        data: result
    });
});
exports.reviewController = {
    createReview,
    getAllReviews,
    getTourReviews,
    getGuideReviews,
    getMyReviews,
    updateReview,
    deleteReview
};
