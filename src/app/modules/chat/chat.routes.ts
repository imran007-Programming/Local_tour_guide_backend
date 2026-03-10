import express from "express";
import { chatController } from "./chat.controller";
import authHelper from "../../middleware/authHelper";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/send", authHelper(Role.GUIDE, Role.TOURIST, Role.ADMIN), chatController.sendMessage);
router.get("/conversations", authHelper(Role.GUIDE, Role.TOURIST, Role.ADMIN), chatController.getConversations);
router.get("/:conversationId/messages", authHelper(Role.GUIDE, Role.TOURIST, Role.ADMIN), chatController.getMessages);

export const chatRoutes = router;