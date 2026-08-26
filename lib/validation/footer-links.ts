import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

const safeLinkUrl = z.string().trim().max(2048).refine((value) => {
  try {
    const url = new URL(value)
    return ["https:", "http:", "mailto:"].includes(url.protocol)
  } catch {
    return false
  }
}, "URL must use http, https, or mailto.")

export const footerLinkInputSchema = z.object({
  label: trimmedText("Label", 80),
  url: safeLinkUrl,
  icon: z.string().trim().min(1, "Icon is required.").max(80).regex(/^[A-Za-z][A-Za-z0-9]*$/, "Icon must be a valid icon name."),
  order: z.coerce.number().int().min(0).max(100_000),
}).strict()

export const footerLinkUpdateSchema = footerLinkInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be supplied." },
)
