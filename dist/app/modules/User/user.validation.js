"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = void 0;
const zod_1 = require("zod");
exports.updateUserZodSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2).optional(),
    profilePic: zod_1.z
        .string()
        .url({ message: "Invalid URL format" })
        .optional(),
    bio: zod_1.z.string().optional(),
    languages: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            }
            catch {
                return val;
            }
        }
        return val;
    }, zod_1.z.array(zod_1.z.string()).optional()),
})
    .strict();
