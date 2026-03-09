"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("./chat.controller");
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/send", (0, authHelper_1.default)(client_1.Role.GUIDE, client_1.Role.TOURIST), chat_controller_1.chatController.sendMessage);
router.get("/conversations", (0, authHelper_1.default)(client_1.Role.GUIDE, client_1.Role.TOURIST), chat_controller_1.chatController.getConversations);
router.get("/:conversationId/messages", (0, authHelper_1.default)(client_1.Role.GUIDE, client_1.Role.TOURIST), chat_controller_1.chatController.getMessages);
exports.chatRoutes = router;
