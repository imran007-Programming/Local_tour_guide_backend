"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const prisma_1 = require("../../lib/prisma");
const socket_1 = require("../../lib/socket");
const sendMessage = async (senderId, data) => {
    const { receiverId, content } = data;
    if (!receiverId || !content) {
        throw new Error("receiverId and content are required");
    }
    // Find conversation in both directions
    let conversation = await prisma_1.prisma.conversation.findFirst({
        where: {
            OR: [
                { user1Id: senderId, user2Id: receiverId },
                { user1Id: receiverId, user2Id: senderId }
            ]
        }
    });
    // Create conversation if it doesn't exist
    if (!conversation) {
        try {
            conversation = await prisma_1.prisma.conversation.create({
                data: { user1Id: senderId, user2Id: receiverId }
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                conversation = await prisma_1.prisma.conversation.findFirst({
                    where: {
                        OR: [
                            { user1Id: senderId, user2Id: receiverId },
                            { user1Id: receiverId, user2Id: senderId }
                        ]
                    }
                });
            }
            if (!conversation)
                throw error;
        }
    }
    const message = await prisma_1.prisma.message.create({
        data: { conversationId: conversation.id, senderId, content }
    });
    const sender = await prisma_1.prisma.user.findUnique({
        where: { id: senderId },
        select: { id: true, name: true, profilePic: true, role: true }
    });
    const messageWithSender = {
        ...message,
        sender,
        conversationId: conversation.id,
        receiverId
    };
    try {
        (0, socket_1.emitNewMessage)(messageWithSender);
    }
    catch (socketError) {
        console.error("Socket emit error:", socketError);
    }
    return messageWithSender;
};
const getConversations = async (userId) => {
    const conversations = await prisma_1.prisma.conversation.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' }
    });
    return Promise.all(conversations.map(async (conv) => {
        const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
        const otherUser = await prisma_1.prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, name: true, profilePic: true, role: true }
        });
        const unreadCount = await prisma_1.prisma.message.count({
            where: { conversationId: conv.id, senderId: otherUserId, isRead: false }
        });
        return { id: conv.id, otherUser, messages: conv.messages, unreadCount };
    }));
};
const getMessages = async (conversationId, userId) => {
    await prisma_1.prisma.message.updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true }
    });
    const messages = await prisma_1.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' }
    });
    return Promise.all(messages.map(async (msg) => ({
        ...msg,
        sender: await prisma_1.prisma.user.findUnique({
            where: { id: msg.senderId },
            select: { id: true, name: true, profilePic: true, role: true }
        })
    })));
};
exports.chatService = {
    sendMessage,
    getConversations,
    getMessages
};
