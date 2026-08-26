import { z } from "zod"
import { slugSchema, trimmedText } from "@/lib/validation/common"

export const postInputSchema = z.object({
  title: trimmedText("Title", 200),
  slug: slugSchema,
  description: trimmedText("Description", 1000),
  content: trimmedText("Content", 200_000),
  tags: z.array(trimmedText("Tag", 80)).max(30).transform((items) => [...new Set(items)]),
  readingTime: trimmedText("Reading time", 50),
  published: z.boolean(),
}).strict()

export const postUpdateSchema = postInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type PostInput = z.infer<typeof postInputSchema>
