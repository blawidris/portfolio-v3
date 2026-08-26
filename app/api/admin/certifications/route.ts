import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { certificationInputSchema } from "@/lib/validation/certifications"
import { revalidateCertifications } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const certifications = await prisma.certification.findMany({ orderBy: { order: "asc" } })
  return Response.json(certifications)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = certificationInputSchema.parse(await parseJsonRequest(req))
    const certification = await prisma.certification.create({ data: input })
    revalidateCertifications()
    return Response.json(certification, { status: 201 })
  } catch (error) {
    return handleApiError(error, "certifications.create")
  }
}
