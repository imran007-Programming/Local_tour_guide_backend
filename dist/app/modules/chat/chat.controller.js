"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const chat_service_1 = require("./chat.service");
const sendMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const senderId = req.user?.userId;
    const result = await chat_service_1.chatService.sendMessage(senderId, req.body);
    (0, sendResponse_1.default)(res, { statusCode: 201, success: true, message: "Message sent", data: result });
});
const getConversations = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await chat_service_1.chatService.getConversations(userId);
    (0, sendResponse_1.default)(res, { statusCode: 200, success: true, message: "Conversations retrieved", data: result });
});
const getMessages = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const conversationId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
    const userId = req.user?.userId;
    const result = await chat_service_1.chatService.getMessages(conversationId, userId);
    (0, sendResponse_1.default)(res, { statusCode: 200, success: true, message: "Messages retrieved", data: result });
});
exports.chatController = { sendMessage, getConversations, getMessages };
