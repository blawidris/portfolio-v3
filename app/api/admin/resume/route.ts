import { randomUUID } from "node:crypto"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, unauthorizedResponse } from "@/lib/errors/api"
import { validateResumeUpload, ResumeValidationError } from "@/lib/validation/resume"
import { uploadMedia, StorageNotConfiguredError } from "@/lib/storage/r2"
import { revalidateResume } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const resumes = await prisma.resume.findMany({ orderBy: { createdAt: "desc" }, include: { media: true } })
  return Response.json(resumes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return apiError(400, "MALFORMED_REQUEST", "A file is required.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { mimeType } = validateResumeUpload(buffer, file.name)

    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const storageKey = `resume/${randomUUID()}-${safeFilename}`

    await uploadMedia(buffer, storageKey, mimeType)

    // A new upload becomes the active resume — every other resume is
    // deactivated in the same transaction so exactly one stays active.
    const resume = await prisma.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: { filename: file.name, mimeType, size: buffer.length, storageKey },
      })
      await tx.resume.updateMany({ where: { isActive: true }, data: { isActive: false } })
      return tx.resume.create({
        data: { mediaId: media.id, publicFilename: file.name, isActive: true },
        include: { media: true },
      })
    })

    revalidateResume()
    return Response.json(resume, { status: 201 })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return apiError(503, "SERVICE_UNCONFIGURED", error.message)
    }
    if (error instanceof ResumeValidationError) {
      return apiError(422, "VALIDATION_ERROR", error.message)
    }
    return handleApiError(error, "resume.create")
  }
}
