import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { certificationUpdateSchema } from "@/lib/validation/certifications"
import { revalidateCertifications } from "@/lib/content/cache"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = certificationUpdateSchema.parse(await parseJsonRequest(req))
    const certification = await prisma.certification.update({ where: { id }, data: input })
    revalidateCertifications()
    return Response.json(certification)
  } catch (error) {
    return handleApiError(error, "certifications.update")
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
    await prisma.certification.delete({ where: { id } })
    revalidateCertifications()
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "certifications.delete")
  }
}
