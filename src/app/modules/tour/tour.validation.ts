import { z } from "zod"


export const createTourZodSchema = z
    .object({
        title: z.string().min(5, "Title is required"),
        description: z.string().min(20, "Description is required"),
        itinerary: z.string().min(3, "Itinerary is required"),

        price: z.coerce.number().positive("Tour fee must be greater than 0"),
        duration: z.coerce.number().positive("Duration must be greater than 0"),
        maxGroupSize: z.coerce.number().positive("Max group size must be greater than 0"),

        meetingPoint: z.string().min(3, "Meeting point is required"),
        city: z.string().min(2, "City is required"),

        languages: z.array(z.string()).min(1, "At least one language is required"),
        category: z.string(),
    })
    .strict()




export const updateTourZodSchema = z
    .object({
        title: z.string().min(5, "Title must be at least 5 characters").optional(),
        description: z.string().min(20, "Description must be at least 20 characters").optional(),
        itinerary: z.string().min(3, "Itinerary must be at least 3 characters").optional(),

        price: z.coerce.number().positive("Tour fee must be greater than 0").optional(),
        duration: z.coerce.number().positive("Duration must be greater than 0").optional(),
        maxGroupSize: z.coerce.number().positive("Max group size must be greater than 0").optional(),

        meetingPoint: z.string().min(3, "Meeting point must be at least 3 characters").optional(),
        city: z.string().min(2, "City must be at least 2 characters").optional(),

        languages: z.array(z.string()).min(1, "At least one language is required").optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional()
    })
    .strict()
