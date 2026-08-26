import { randomUUID } from "node:crypto"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, unauthorizedResponse } from "@/lib/errors/api"
import { validateMediaUpload, MediaValidationError } from "@/lib/validation/media"
import { uploadMedia, getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } })
    return Response.json(media.map((item) => ({ ...item, url: getMediaUrl(item.storageKey) })))
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return apiError(503, "SERVICE_UNCONFIGURED", error.message)
    }
    return handleApiError(error, "media.list")
  }
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
    const { mimeType } = validateMediaUpload(buffer, file.name)

    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const storageKey = `media/${randomUUID()}-${safeFilename}`

    await uploadMedia(buffer, storageKey, mimeType)

    const media = await prisma.media.create({
      data: { filename: file.name, mimeType, size: buffer.length, storageKey },
    })

    return Response.json({ ...media, url: getMediaUrl(media.storageKey) }, { status: 201 })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return apiError(503, "SERVICE_UNCONFIGURED", error.message)
    }
    if (error instanceof MediaValidationError) {
      return apiError(422, "VALIDATION_ERROR", error.message)
    }
    return handleApiError(error, "media.create")
  }
}
