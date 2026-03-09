import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { chatService } from "./chat.service";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req as any).user?.userId;
  const result = await chatService.sendMessage(senderId, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Message sent", data: result });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const result = await chatService.getConversations(userId);
  sendResponse(res, { statusCode: 200, success: true, message: "Conversations retrieved", data: result });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const conversationId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const userId = (req as any).user?.userId;
  const result = await chatService.getMessages(conversationId, userId);
  sendResponse(res, { statusCode: 200, success: true, message: "Messages retrieved", data: result });
});

export const chatController = { sendMessage, getConversations, getMessages };