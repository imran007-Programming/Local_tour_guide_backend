import { prisma } from "../../lib/prisma";
import { IUser } from "../../../types/user.interface";
import { NotificationType } from "@prisma/client";
import { emitNewNotification, emitNotificationRead } from "../../lib/socket";

const createNotification = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}) => {
  const notification = await prisma.notification.create({ data });
  
  // Emit real-time notification
  emitNewNotification(data.userId);
  
  return notification;
};

const createAdminNotification = async (type: string, data: any) => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  
  const notifications = admins.map(admin => ({
    userId: admin.id,
    type: type as NotificationType,
    title: getNotificationTitle(type, data),
    message: getNotificationMessage(type, data),
    isRead: false
  }));
  
  const result = await prisma.notification.createMany({ data: notifications });
  
  // Emit real-time notifications to all admins
  admins.forEach(admin => {
    emitNewNotification(admin.id);
  });
  
  return result;
};

const getNotificationTitle = (type: string, data: any) => {
  switch(type) {
    case 'BOOKING': return 'New Booking';
    case 'PAYMENT': return 'Payment Received';
    case 'GENERAL': return 'System Notification';
    default: return 'System Notification';
  }
};

const getNotificationMessage = (type: string, data: any) => {
  switch(type) {
    case 'BOOKING': 
      return `New booking by ${data.userName} for ${data.tourTitle}`;
    case 'PAYMENT': 
      return `Payment of $${data.amount} received for booking #${data.bookingId}`;
    case 'GENERAL':
      if (data.type === 'USER_REGISTERED') {
        return `New ${data.role} user registered: ${data.name}`;
      }
      if (data.type === 'TOUR_CREATED') {
        return `New tour listing: ${data.title} by ${data.guideName}`;
      }
      if (data.type === 'STATUS_UPDATE') {
        return `Booking #${data.bookingId} status changed to ${data.status}`;
      }
      return data.message || 'System notification';
    default: 
      return data.message || 'System notification';
  }
};

const getUserNotifications = async (user: IUser) => {
  return await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });
};

const markAsRead = async (user: IUser, notificationId: string) => {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.userId },
    data: { isRead: true },
  });
  
  // Emit notification read event
  emitNotificationRead(user.userId);
  
  return result;
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
  createAdminNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
