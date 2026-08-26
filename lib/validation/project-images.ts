import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

export const projectImageInputSchema = z.object({
  projectId: trimmedText("Project", 100),
  mediaId: trimmedText("Media", 100),
  role: z.enum(["gallery", "diagram"], { message: "Role must be gallery or diagram." }).default("gallery"),
  caption: z.string().trim().max(300).optional(),
  order: z.coerce.number().int().min(0).max(100_000).default(0),
}).strict()

export type ProjectImageInput = z.infer<typeof projectImageInputSchema>
