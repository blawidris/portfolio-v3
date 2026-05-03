import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } })
  return Response.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const project = await prisma.project.create({ data: body })
  revalidateTag("projects", "default")
  return Response.json(project, { status: 201 })
}
