import express from "express";
import { notificationController } from "./notification.controller";
import auth from "../../middleware/authHelper";

const router = express.Router();

router.get("/", auth(), notificationController.getUserNotifications);
router.patch("/:id/read", auth(), notificationController.markAsRead);
router.patch("/read-all", auth(), notificationController.markAllAsRead);
router.delete("/:id", auth(), notificationController.deleteNotification);

export const notificationRoutes = router;
