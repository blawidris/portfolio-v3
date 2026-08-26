import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

// Shared shape with no .default() — see lib/validation/projects.ts for why
// the update schema must not inherit defaults from the create schema.
const experienceShape = {
  role: trimmedText("Role", 160),
  company: trimmedText("Company", 160),
  period: trimmedText("Period", 80),
  description: trimmedText("Description", 4000),
  technologies: z.array(trimmedText("Technology", 80)).max(50).transform((items) => [...new Set(items)]),
  isCurrent: z.boolean(),
  visible: z.boolean(),
  order: z.coerce.number().int().min(0).max(100_000),
}

export const experienceInputSchema = z.object({
  ...experienceShape,
  technologies: experienceShape.technologies.default([]),
  isCurrent: experienceShape.isCurrent.default(false),
  visible: experienceShape.visible.default(true),
  order: experienceShape.order.default(0),
}).strict()

export const experienceUpdateSchema = z.object(experienceShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type ExperienceInput = z.infer<typeof experienceInputSchema>
