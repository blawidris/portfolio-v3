import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { projectInputSchema } from "@/lib/validation/projects"
import { revalidateProjectContent } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } })
  return Response.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = projectInputSchema.parse(await parseJsonRequest(req))
    const project = await prisma.project.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        content: input.content,
        type: input.type,
        category: input.category,
        status: input.status,
        year: input.year,
        stack: input.stack,
        featured: input.featured,
        order: input.order,
        published: input.published,
        coverMediaId: input.coverMediaId,
      },
    })
    revalidateProjectContent(project.slug)
    return Response.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error, "projects.create")
  }
}
