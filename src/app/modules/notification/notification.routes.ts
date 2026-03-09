import { Router } from "express";
import { notificationController } from "./notification.controller";
import authHelper from "../../middleware/authHelper";

const router = Router();

router.get("/", authHelper(), notificationController.getUserNotifications);
router.post("/:id/read", authHelper(), notificationController.markAsRead);
router.post("/read-all", authHelper(), notificationController.markAllAsRead);
router.delete("/:id", authHelper(), notificationController.deleteNotification);

export const notificationRoutes = router;
