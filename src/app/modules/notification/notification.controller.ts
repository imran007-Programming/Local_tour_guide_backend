import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { notificationService } from "./notification.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await notificationService.getUserNotifications(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAsRead(req.user, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read",
    data: null,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(req.user, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification deleted",
    data: null,
  });
});

export const notificationController = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
