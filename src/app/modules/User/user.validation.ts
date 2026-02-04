import { z } from "zod";

export const updateUserZodSchema = z.object({
    name: z.string().min(2).optional(),
    profilePic: z.string().url().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
}).strict()
