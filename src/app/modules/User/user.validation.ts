import { z } from "zod";

export const updateUserZodSchema = z
    .object({
        name: z.string().min(2).optional(),
        profilePic: z
            .string()
            .url({ message: "Invalid URL format" })
            .optional(),
        bio: z.string().optional(),

        languages: z.preprocess(
            (val) => {
                if (typeof val === "string") {
                    try {
                        return JSON.parse(val);
                    } catch {
                        return val;
                    }
                }
                return val;
            },
            z.array(z.string()).optional()
        ),
    })
    .strict();