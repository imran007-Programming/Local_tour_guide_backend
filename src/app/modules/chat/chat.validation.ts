import { z } from "zod";

const sendMessageValidation = z.object({
  body: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
    content: z.string().min(1, "Message content is required")
  })
});

export const chatValidation = {
  sendMessageValidation
};