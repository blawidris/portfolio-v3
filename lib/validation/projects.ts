import { z } from "zod"
import { slugSchema, trimmedText } from "@/lib/validation/common"

const currentYear = new Date().getFullYear()

// Shared shape with no .default() — .partial() does not strip .default(),
// so an update schema built from a defaulted field would silently reapply
// that default whenever the field is omitted from a PATCH payload. Only
// the create schema below should carry defaults.
const projectShape = {
  title: trimmedText("Title", 160),
  slug: slugSchema,
  description: trimmedText("Description", 1000),
  content: z.string().trim().max(100_000, "Content is too long."),
  type: trimmedText("Type", 50),
  category: z.enum(["work", "side-project"], { message: "Category must be work or side-project." }),
  status: trimmedText("Status", 50),
  year: z.coerce.number().int().min(1900).max(currentYear + 5),
  stack: z.array(trimmedText("Technology", 80)).max(50).transform((items) => [...new Set(items)]),
  featured: z.boolean(),
  order: z.coerce.number().int().min(0).max(100_000),
}

export const projectInputSchema = z.object({
  ...projectShape,
  category: projectShape.category.default("side-project"),
}).strict()

export const projectUpdateSchema = z.object(projectShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type ProjectInput = z.infer<typeof projectInputSchema>
