"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const prisma_1 = require("../../lib/prisma");
const getOrCreateConversation = async (userId1, userId2) => {
    const participants = [userId1, userId2].sort();
    let conversation = await prisma_1.prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { has: userId1 } },
                { participants: { has: userId2 } },
            ],
        },
    });
    if (!conversation) {
        conversation = await prisma_1.prisma.conversation.create({
            data: { participants },
        });
    }
    return conversation;
};
const sendMessage = async (user, receiverId, content) => {
    const conversation = await getOrCreateConversation(user.userId, receiverId);
    const senderInfo = await prisma_1.prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true },
    });
    const message = await prisma_1.prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderId: user.userId,
            content,
        },
        include: {
            sender: { select: { id: true, name: true, profilePic: true, role: true } },
        },
    });
    // Emit via Socket.IO
    const io = global.io;
    if (io) {
        io.to(conversation.id).emit("new-message", message);
    }
    // Create notification for receiver
    await prisma_1.prisma.notification.create({
        data: {
            userId: receiverId,
            type: "GENERAL",
            title: "New Message",
            message: `${senderInfo?.name || 'Someone'} sent you a message`,
            metadata: { conversationId: conversation.id },
        },
    });
    return message;
};
const getConversations = async (user) => {
    const conversations = await prisma_1.prisma.conversation.findMany({
        where: {
            participants: { has: user.userId },
        },
        include: {
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
        orderBy: { updatedAt: "desc" },
    });
    const conversationsWithUsers = await Promise.all(conversations.map(async (conv) => {
        const otherUserId = conv.participants.find((id) => id !== user.userId);
        const otherUser = await prisma_1.prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, name: true, profilePic: true, role: true },
        });
        const unreadCount = await prisma_1.prisma.message.count({
            where: {
                conversationId: conv.id,
                senderId: { not: user.userId },
                isRead: false,
            },
        });
        return {
            ...conv,
            otherUser,
            unreadCount,
        };
    }));
    return conversationsWithUsers;
};
const getMessages = async (user, conversationId) => {
    const conversation = await prisma_1.prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: { has: user.userId },
        },
    });
    if (!conversation)
        throw new Error("Conversation not found");
    await prisma_1.prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: user.userId },
            isRead: false,
        },
        data: { isRead: true },
    });
    return await prisma_1.prisma.message.findMany({
        where: { conversationId },
        include: {
            sender: { select: { id: true, name: true, profilePic: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
    });
};
exports.chatService = {
    sendMessage,
    getConversations,
    getMessages,
};
