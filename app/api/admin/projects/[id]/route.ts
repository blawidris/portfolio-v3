import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { projectUpdateSchema } from "@/lib/validation/projects"
import { revalidateProjectContent } from "@/lib/content/cache"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(project)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = projectUpdateSchema.parse(await parseJsonRequest(req))
    const existing = await prisma.project.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) return Response.json({ error: { code: "NOT_FOUND", message: "The requested project was not found." } }, { status: 404 })

    const project = await prisma.project.update({ where: { id }, data: input })
    revalidateProjectContent(existing.slug, project.slug)
    return Response.json(project)
  } catch (error) {
    return handleApiError(error, "projects.update")
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
    const existing = await prisma.project.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) return Response.json({ error: { code: "NOT_FOUND", message: "The requested project was not found." } }, { status: 404 })
    await prisma.project.delete({ where: { id } })
    revalidateProjectContent(existing.slug)
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "projects.delete")
  }
}
