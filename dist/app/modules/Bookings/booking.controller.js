"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const booking_service_1 = require("./booking.service");
const booking_contant_1 = require("./booking.contant");
const Pick_1 = __importDefault(require("../../helper/Pick"));
const createBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const user = req.user;
    const result = await booking_service_1.bookingService.createBooking(user, payload);
    (0, sendResponse_1.default)(res, ({
        statusCode: 201,
        success: true,
        message: "Booking create successfully",
        data: result,
    }));
});
const getMyBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = (0, Pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, Pick_1.default)(req.query, booking_contant_1.bookingFilterableFields);
    const user = req.user;
    const result = await booking_service_1.bookingService.getMyBooking(user, options, filters);
    (0, sendResponse_1.default)(res, ({
        statusCode: 201,
        success: true,
        message: "Booking retrived successfully",
        data: result
    }));
});
const completedBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const bookingId = req.params.bookingId;
    const result = await booking_service_1.bookingService.completedBooking(user, bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "status updated successfully",
        data: result
    });
});
const cancelBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const bookingId = String(req.params.bookingId);
    const user = req.user;
    const payload = req.body;
    const result = await booking_service_1.bookingService.cancelBooking(user, payload, bookingId);
    (0, sendResponse_1.default)(res, ({
        statusCode: 201,
        success: true,
        message: "Booking canceled successfully",
        data: result,
    }));
});
const getAssignedBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = (0, Pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, Pick_1.default)(req.query, booking_contant_1.bookingFilterableFields);
    const user = req.user;
    const result = await booking_service_1.bookingService.getAssignedBooking(options, filters, req, user);
    (0, sendResponse_1.default)(res, ({
        statusCode: 201,
        success: true,
        message: "Booking retrived successfully successfully",
        data: result,
    }));
});
const updateBookingStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const bookingId = req.params.bookingId;
    const payload = req.body;
    const result = await booking_service_1.bookingService.updateBookingStatus(user, bookingId, payload);
    (0, sendResponse_1.default)(res, ({
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result,
    }));
});
const getAdminStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await booking_service_1.bookingService.getAdminStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Stats retrieved successfully",
        data: result
    });
});
const getGuideStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await booking_service_1.bookingService.getGuideStats(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Stats retrieved successfully",
        data: result
    });
});
const getTouristStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await booking_service_1.bookingService.getTouristStats(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Stats retrieved successfully",
        data: result
    });
});
const getAllBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = (0, Pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, Pick_1.default)(req.query, booking_contant_1.bookingFilterableFields);
    const result = await booking_service_1.bookingService.getAllBookings(options, filters);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: result
    });
});
exports.bookingController = {
    createBooking,
    getMyBookings,
    cancelBooking,
    getAssignedBooking,
    updateBookingStatus,
    completedBooking,
    getAdminStats,
    getGuideStats,
    getTouristStats,
    getAllBookings
};
