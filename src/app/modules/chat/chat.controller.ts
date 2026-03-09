import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { chatService } from "./chat.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.sendMessage(req.user, req.body.receiverId, req.body.content);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message sent",
    data: result,
  });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getConversations(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversations retrieved",
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getMessages(req.user, req.params.conversationId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved",
    data: result,
  });
});

export const chatController = {
  sendMessage,
  getConversations,
  getMessages,
};
