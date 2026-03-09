import { prisma } from "../../lib/prisma";
import { IUser } from "../../../types/user.interface";
import { NotificationType } from "@prisma/client";

const createNotification = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}) => {
  return await prisma.notification.create({ data });
};

const getUserNotifications = async (user: IUser) => {
  return await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });
};

const markAsRead = async (user: IUser, notificationId: string) => {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.userId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (user: IUser) => {
  return await prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true },
  });
};

const deleteNotification = async (user: IUser, notificationId: string) => {
  return await prisma.notification.deleteMany({
    where: { id: notificationId, userId: user.userId },
  });
};

export const notificationService = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
