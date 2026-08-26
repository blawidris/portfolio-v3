import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

const credentialUrl = z.string().trim().max(2048).refine((value) => {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}, "Credential URL must use http or https.").optional()

// Shared shape with no .default() — see lib/validation/projects.ts for why
// the update schema must not inherit defaults from the create schema.
const certificationShape = {
  name: trimmedText("Name", 200),
  issuer: trimmedText("Issuer", 200),
  issueDate: z.coerce.date(),
  credentialUrl,
  badgeMediaId: z.string().trim().min(1).optional(),
  visible: z.boolean(),
  order: z.coerce.number().int().min(0).max(100_000),
}

export const certificationInputSchema = z.object({
  ...certificationShape,
  visible: certificationShape.visible.default(true),
  order: certificationShape.order.default(0),
}).strict()

export const certificationUpdateSchema = z.object(certificationShape).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)

export type CertificationInput = z.infer<typeof certificationInputSchema>
