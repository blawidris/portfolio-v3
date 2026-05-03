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
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(post)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const post = await prisma.post.update({ where: { id }, data: body })
  revalidateTag("posts", "default")
  return Response.json(post)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.post.delete({ where: { id } })
  revalidateTag("posts", "default")
  return new Response(null, { status: 204 })
}
