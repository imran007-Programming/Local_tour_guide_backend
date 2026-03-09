"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const router = (0, express_1.Router)();
router.get("/", (0, authHelper_1.default)(), notification_controller_1.notificationController.getUserNotifications);
router.patch("/read-all", (0, authHelper_1.default)(), notification_controller_1.notificationController.markAllAsRead);
router.post("/:id/read", (0, authHelper_1.default)(), notification_controller_1.notificationController.markAsRead);
router.post("/read-all", (0, authHelper_1.default)(), notification_controller_1.notificationController.markAllAsRead);
router.delete("/:id", (0, authHelper_1.default)(), notification_controller_1.notificationController.deleteNotification);
exports.notificationRoutes = router;
