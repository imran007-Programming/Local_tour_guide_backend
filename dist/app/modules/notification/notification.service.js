"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../../lib/prisma");
const socket_1 = require("../../lib/socket");
const createNotification = async (data) => {
    const notification = await prisma_1.prisma.notification.create({ data });
    // Emit real-time notification
    (0, socket_1.emitNewNotification)(data.userId);
    return notification;
};
const createAdminNotification = async (type, data) => {
    const admins = await prisma_1.prisma.user.findMany({
        where: { role: 'ADMIN' }
    });
    const notifications = admins.map(admin => ({
        userId: admin.id,
        type: type,
        title: getNotificationTitle(type, data),
        message: getNotificationMessage(type, data),
        isRead: false
    }));
    const result = await prisma_1.prisma.notification.createMany({ data: notifications });
    // Emit real-time notifications to all admins
    admins.forEach(admin => {
        (0, socket_1.emitNewNotification)(admin.id);
    });
    return result;
};
const getNotificationTitle = (type, data) => {
    switch (type) {
        case 'BOOKING': return 'New Booking';
        case 'PAYMENT': return 'Payment Received';
        case 'GENERAL': return 'System Notification';
        default: return 'System Notification';
    }
};
const getNotificationMessage = (type, data) => {
    switch (type) {
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
const getUserNotifications = async (user) => {
    return await prisma_1.prisma.notification.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
    });
};
const markAsRead = async (user, notificationId) => {
    const result = await prisma_1.prisma.notification.updateMany({
        where: { id: notificationId, userId: user.userId },
        data: { isRead: true },
    });
    // Emit notification read event
    (0, socket_1.emitNotificationRead)(user.userId);
    return result;
};
const markAllAsRead = async (user) => {
    return await prisma_1.prisma.notification.updateMany({
        where: { userId: user.userId, isRead: false },
        data: { isRead: true },
    });
};
const deleteNotification = async (user, notificationId) => {
    return await prisma_1.prisma.notification.deleteMany({
        where: { id: notificationId, userId: user.userId },
    });
};
exports.notificationService = {
    createNotification,
    createAdminNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
