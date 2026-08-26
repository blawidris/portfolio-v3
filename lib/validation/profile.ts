import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

export const profileUpdateSchema = z.object({
  name: trimmedText("Name", 160),
  headline: trimmedText("Headline", 200),
  tagline: trimmedText("Tagline", 300),
  bio: trimmedText("Bio", 10_000),
  philosophy: z.array(trimmedText("Principle", 300)).max(20),
  location: trimmedText("Location", 160),
  availability: trimmedText("Availability", 160),
}).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
