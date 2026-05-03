import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

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
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const project = await prisma.project.update({ where: { id }, data: body })
  revalidateTag("projects", "default")
  return Response.json(project)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.project.delete({ where: { id } })
  revalidateTag("projects", "default")
  return new Response(null, { status: 204 })
}
