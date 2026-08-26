import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, handleApiError, unauthorizedResponse } from "@/lib/errors/api"
import { deleteMedia, StorageNotConfiguredError } from "@/lib/storage/r2"
import { revalidateResume } from "@/lib/content/cache"

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const resume = await prisma.$transaction(async (tx) => {
      await tx.resume.updateMany({ where: { isActive: true }, data: { isActive: false } })
      return tx.resume.update({ where: { id }, data: { isActive: true }, include: { media: true } })
    })
    revalidateResume()
    return Response.json(resume)
  } catch (error) {
    return handleApiError(error, "resume.activate")
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const resume = await prisma.resume.findUnique({ where: { id }, include: { media: true } })
    if (!resume) return apiError(404, "NOT_FOUND", "The requested record was not found.")

    await deleteMedia(resume.media.storageKey)
    // Deleting Media cascades to delete this Resume row (onDelete: Cascade).
    await prisma.media.delete({ where: { id: resume.mediaId } })

    revalidateResume()
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return apiError(503, "SERVICE_UNCONFIGURED", error.message)
    }
    return handleApiError(error, "resume.delete")
  }
}
