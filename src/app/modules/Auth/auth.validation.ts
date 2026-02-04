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
    .superRefine((data, ctx) => {
        // GUIDE validation
        if (data.role === "GUIDE") {
            if (!data.expertise || data.expertise.length === 0) {
                ctx.addIssue({
                    path: ["expertise"],
                    message: "Expertise is required for GUIDE",
                    code: z.ZodIssueCode.custom,
                });
            }

            if (!data.dailyRate) {
                ctx.addIssue({
                    path: ["dailyRate"],
                    message: "Daily rate is required for GUIDE",
                    code: z.ZodIssueCode.custom,
                });
            }
        }

        // TOURIST validation
        if (data.role === "TOURIST") {
            if (!data.preferences || data.preferences.length === 0) {
                ctx.addIssue({
                    path: ["preferences"],
                    message: "Preferences are required for TOURIST",
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    })