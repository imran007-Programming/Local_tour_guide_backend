"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const chat_service_1 = require("./chat.service");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const sendMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await chat_service_1.chatService.sendMessage(req.user, req.body.receiverId, req.body.content);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message sent",
        data: result,
    });
});
const getConversations = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await chat_service_1.chatService.getConversations(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Conversations retrieved",
        data: result,
    });
});
const getMessages = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await chat_service_1.chatService.getMessages(req.user, req.params.conversationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Messages retrieved",
        data: result,
    });
});
exports.chatController = {
    sendMessage,
    getConversations,
    getMessages,
};
