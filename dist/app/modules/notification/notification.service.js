"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../../lib/prisma");
const createNotification = async (data) => {
    return await prisma_1.prisma.notification.create({ data });
};
const getUserNotifications = async (user) => {
    return await prisma_1.prisma.notification.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
    });
};
const markAsRead = async (user, notificationId) => {
    return await prisma_1.prisma.notification.updateMany({
        where: { id: notificationId, userId: user.userId },
        data: { isRead: true },
    });
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
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
