"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const notification_service_1 = require("./notification.service");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const getUserNotifications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await notification_service_1.notificationService.getUserNotifications(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notifications retrieved successfully",
        data: result,
    });
});
const markAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await notification_service_1.notificationService.markAsRead(req.user, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification marked as read",
        data: null,
    });
});
const markAllAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await notification_service_1.notificationService.markAllAsRead(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All notifications marked as read",
        data: null,
    });
});
const deleteNotification = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await notification_service_1.notificationService.deleteNotification(req.user, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification deleted",
        data: null,
    });
});
exports.notificationController = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
