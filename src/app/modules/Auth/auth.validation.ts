import { z } from "zod";
export const createUSerZodSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(5, "Password must be at least 5 characters"),
    role: z.enum(["TOURIST", "GUIDE", "ADMIN"]),

    profilePic: z.string().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),

    // GUIDE fields
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().positive().optional(),

    // TOURIST fields
    preferences: z.array(z.string()).optional(),
})
