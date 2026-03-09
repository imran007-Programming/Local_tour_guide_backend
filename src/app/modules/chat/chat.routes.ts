import express from "express";
import { chatController } from "./chat.controller";
import auth from "../../middleware/authHelper";

const router = express.Router();

router.post("/send", auth(), chatController.sendMessage);
router.get("/conversations", auth(), chatController.getConversations);
router.get("/:conversationId/messages", auth(), chatController.getMessages);

export const chatRoutes = router;
