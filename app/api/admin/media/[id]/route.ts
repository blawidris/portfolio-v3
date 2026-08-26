import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, unauthorizedResponse } from "@/lib/errors/api"
import { deleteMedia, StorageNotConfiguredError } from "@/lib/storage/r2"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) return apiError(404, "NOT_FOUND", "The requested record was not found.")

    await deleteMedia(media.storageKey)
    await prisma.media.delete({ where: { id } })

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return apiError(503, "SERVICE_UNCONFIGURED", error.message)
    }
    return handleApiError(error, "media.delete")
  }
}
