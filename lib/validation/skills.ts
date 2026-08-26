import { z } from "zod"
import { slugSchema, trimmedText } from "@/lib/validation/common"

// Shared shapes with no .default() — see lib/validation/projects.ts for why
// the update schemas must not inherit defaults from the create schemas.
const skillCategoryShape = {
  name: trimmedText("Name", 100),
  slug: slugSchema,
  order: z.coerce.number().int().min(0).max(100_000),
  visible: z.boolean(),
}

export const skillCategoryInputSchema = z.object({
  ...skillCategoryShape,
  order: skillCategoryShape.order.default(0),
  visible: skillCategoryShape.visible.default(true),
}).strict()

export const skillCategoryUpdateSchema = z.object(skillCategoryShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

const iconName = z.string().trim().max(80).regex(/^[A-Za-z][A-Za-z0-9]*$/, "Icon must be a valid icon name.").optional()

const skillShape = {
  name: trimmedText("Name", 100),
  categoryId: trimmedText("Category", 100),
  icon: iconName,
  featured: z.boolean(),
  visible: z.boolean(),
  order: z.coerce.number().int().min(0).max(100_000),
}

export const skillInputSchema = z.object({
  ...skillShape,
  featured: skillShape.featured.default(false),
  visible: skillShape.visible.default(true),
  order: skillShape.order.default(0),
}).strict()

export const skillUpdateSchema = z.object(skillShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type SkillCategoryInput = z.infer<typeof skillCategoryInputSchema>
export type SkillInput = z.infer<typeof skillInputSchema>
