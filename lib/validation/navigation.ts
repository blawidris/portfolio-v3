import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

const internalHref = z.string().trim().min(1, "Link is required.").max(200)
  .regex(/^\//, "Link must start with a slash.")

// Shared shape with no .default() — see lib/validation/projects.ts for why
// the update schema must not inherit defaults from the create schema.
const navigationItemShape = {
  label: trimmedText("Label", 60),
  href: internalHref,
  order: z.coerce.number().int().min(0).max(100_000),
  visible: z.boolean(),
}

export const navigationItemInputSchema = z.object({
  ...navigationItemShape,
  order: navigationItemShape.order.default(0),
  visible: navigationItemShape.visible.default(true),
}).strict()

export const navigationItemUpdateSchema = z.object(navigationItemShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type NavigationItemInput = z.infer<typeof navigationItemInputSchema>
