"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGuideZodSchema = void 0;
const zod_1 = require("zod");
exports.updateGuideZodSchema = zod_1.z.object({
    expertise: zod_1.z
        .array(zod_1.z.string().min(1, "Expertise cannot be empty"))
        .min(1, "At least one expertise is required")
        .optional(),
    dailyRate: zod_1.z
        .number({
        error: "Daily rate must be a number",
    })
        .positive("Daily rate must be greater than 0")
        .optional(),
}).strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be updated",
});
