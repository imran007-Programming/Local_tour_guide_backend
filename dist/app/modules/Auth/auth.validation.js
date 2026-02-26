"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUSerZodSchema = void 0;
const zod_1 = require("zod");
exports.createUSerZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name is required"),
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(5, "Password must be at least 5 characters"),
    role: zod_1.z.enum(["TOURIST", "GUIDE", "ADMIN"]),
    profilePic: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    // GUIDE fields
    expertise: zod_1.z.array(zod_1.z.string()).optional(),
    dailyRate: zod_1.z.number().positive().optional(),
    // TOURIST fields
    preferences: zod_1.z.array(zod_1.z.string()).optional(),
});
