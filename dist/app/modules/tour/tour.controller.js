"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const tour_service_1 = require("./tour.service");
const Pick_1 = __importDefault(require("../../helper/Pick"));
const tour_constant_1 = require("./tour.constant");
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const createTour = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await tour_service_1.tourService.createTour(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Tour created successfully",
        data: result,
    });
});
const getAllTourFromDb = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = (0, Pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder", "maxPrice", "minPrice"]);
    const filters = (0, Pick_1.default)(req.query, tour_constant_1.tourFilterableFields);
    const result = await tour_service_1.tourService.getAllTour(options, filters);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tour Retrived successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getSingleTour = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const slug = req.params.slug;
    const result = await tour_service_1.tourService.getSingleTour(slug);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tour retrieved successfully",
        data: result,
    });
});
const updateTour = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const tourId = req.params.tourId;
    const payload = req.body;
    const result = await tour_service_1.tourService.updateTour(tourId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        message: "tour updated successfully",
        success: true,
        data: result
    });
});
const deleteTour = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const tourId = req.params.tourId;
    const result = await tour_service_1.tourService.deleteTour(tourId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        message: "tour deleted successfully",
        success: true,
        data: result
    });
});
const addTourImages = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    if (!req.files || !Array.isArray(req.files)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "No images uploaded");
    }
    const result = await tour_service_1.tourService.addTourImages(id, req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Images added successfully",
        data: result
    });
});
const deleteTourImage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { imageUrl } = req.body;
    if (!imageUrl) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Image URL is required");
    }
    const result = await tour_service_1.tourService.deleteTourImage(id, imageUrl);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Image deleted successfully",
        data: result
    });
});
const getCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await tour_service_1.tourService.getCategories();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Categories retrieved successfully",
        data: result
    });
});
exports.tourController = {
    createTour,
    getAllTourFromDb,
    getSingleTour,
    updateTour,
    deleteTour,
    addTourImages,
    deleteTourImage,
    getCategories
};
