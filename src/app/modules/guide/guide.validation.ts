import { z } from "zod";

export const updateGuideZodSchema = z.object({
    expertise: z
        .array(z.string().min(1, "Expertise cannot be empty"))
        .min(1, "At least one expertise is required")
        .optional(),

    dailyRate: z
        .number({
            error: "Daily rate must be a number",
        })
        .positive("Daily rate must be greater than 0")
        .optional(),
}).strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be updated",
        })


