import { z } from "zod"

/**
 * Shared shapes for the two public landing-page conversion forms
 * (Become a Merchant / Become a Campus Ambassador).
 *
 * Both are validated with the same schema on the client (for inline field
 * errors) and again in the route handler (never trust the client).
 */

const phone = z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number")

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Keep this under ${max} characters`)
        .optional()
        .or(z.literal(""))

export const merchantApplicationSchema = z.object({
    businessName: z.string().trim().min(2, "Business name is required").max(120),
    contactName: z.string().trim().min(2, "Your name is required").max(120),
    email: z.string().trim().email("Enter a valid email address").max(160),
    phone,
    city: z.string().trim().min(2, "City is required").max(80),
    category: z.string().trim().min(1, "Pick a category"),
    branchCount: z.string().trim().min(1, "Pick a branch count"),
    website: optionalText(200),
    message: optionalText(1000),
})

export const ambassadorApplicationSchema = z.object({
    fullName: z.string().trim().min(2, "Your name is required").max(120),
    email: z.string().trim().email("Enter a valid email address").max(160),
    phone,
    institute: z.string().trim().min(2, "Your university or college is required").max(160),
    yearOfStudy: z.string().trim().min(1, "Pick your year of study"),
    city: z.string().trim().min(2, "City is required").max(80),
    instagram: optionalText(80),
    motivation: z
        .string()
        .trim()
        .min(20, "Tell us a bit more — at least 20 characters")
        .max(1000, "Keep this under 1000 characters"),
})

export type MerchantApplication = z.infer<typeof merchantApplicationSchema>
export type AmbassadorApplication = z.infer<typeof ambassadorApplicationSchema>

export const BRANCH_COUNT_OPTIONS = ["1", "2–5", "6–15", "16–50", "50+"]

export const YEAR_OF_STUDY_OPTIONS = [
    "1st year",
    "2nd year",
    "3rd year",
    "4th year",
    "5th year or above",
    "Postgraduate",
]

/** Flattens a ZodError into a { field: message } map for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
    const out: Record<string, string> = {}
    for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "")
        if (key && !out[key]) out[key] = issue.message
    }
    return out
}
