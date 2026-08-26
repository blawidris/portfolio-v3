import { z } from "zod"
import { slugSchema, trimmedText } from "@/lib/validation/common"

// Shared shape with no .default() — see lib/validation/projects.ts for why
// the update schema must not inherit defaults from the create schema.
const caseStudyShape = {
  title: trimmedText("Title", 200),
  slug: slugSchema,
  summary: trimmedText("Summary", 500),
  content: z.string().trim().max(100_000, "Content is too long."),
  projectId: z.string().trim().min(1).optional(),
  coverMediaId: z.string().trim().min(1).optional(),
  published: z.boolean(),
  order: z.coerce.number().int().min(0).max(100_000),
}

export const caseStudyInputSchema = z.object({
  ...caseStudyShape,
  order: caseStudyShape.order.default(0),
}).strict()

export const caseStudyUpdateSchema = z.object(caseStudyShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type CaseStudyInput = z.infer<typeof caseStudyInputSchema>
