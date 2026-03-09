"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatValidation = void 0;
const zod_1 = require("zod");
const sendMessageValidation = zod_1.z.object({
    body: zod_1.z.object({
        receiverId: zod_1.z.string().min(1, "Receiver ID is required"),
        content: zod_1.z.string().min(1, "Message content is required")
    })
});
exports.chatValidation = {
    sendMessageValidation
};
