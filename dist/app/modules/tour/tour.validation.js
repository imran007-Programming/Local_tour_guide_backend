"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourZodSchema = exports.createTourZodSchema = void 0;
const zod_1 = require("zod");
exports.createTourZodSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(5, "Title is required"),
    description: zod_1.z.string().min(20, "Description is required"),
    itinerary: zod_1.z.string().min(3, "Itinerary is required"),
    price: zod_1.z.coerce.number().positive("Tour fee must be greater than 0"),
    duration: zod_1.z.coerce.number().positive("Duration must be greater than 0"),
    maxGroupSize: zod_1.z.coerce.number().positive("Max group size must be greater than 0"),
    meetingPoint: zod_1.z.string().min(3, "Meeting point is required"),
    city: zod_1.z.string().min(2, "City is required"),
    languages: zod_1.z.array(zod_1.z.string()).min(1, "At least one language is required"),
    category: zod_1.z.string(),
})
    .strict();
exports.updateTourZodSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(5, "Title must be at least 5 characters").optional(),
    description: zod_1.z.string().min(20, "Description must be at least 20 characters").optional(),
    itinerary: zod_1.z.string().min(3, "Itinerary must be at least 3 characters").optional(),
    price: zod_1.z.coerce.number().positive("Tour fee must be greater than 0").optional(),
    duration: zod_1.z.coerce.number().positive("Duration must be greater than 0").optional(),
    maxGroupSize: zod_1.z.coerce.number().positive("Max group size must be greater than 0").optional(),
    meetingPoint: zod_1.z.string().min(3, "Meeting point must be at least 3 characters").optional(),
    city: zod_1.z.string().min(2, "City must be at least 2 characters").optional(),
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
    category: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional()
})
    .strict();
