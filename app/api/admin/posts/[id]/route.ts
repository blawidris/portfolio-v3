import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { postUpdateSchema } from "@/lib/validation/posts"
import { revalidateArticleContent } from "@/lib/content/cache"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

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
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = postUpdateSchema.parse(await parseJsonRequest(req))
    const existing = await prisma.post.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) return Response.json({ error: { code: "NOT_FOUND", message: "The requested post was not found." } }, { status: 404 })
    const post = await prisma.post.update({ where: { id }, data: input })
    revalidateArticleContent(existing.slug, post.slug)
    return Response.json(post)
  } catch (error) {
    return handleApiError(error, "posts.update")
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
    const existing = await prisma.post.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) return Response.json({ error: { code: "NOT_FOUND", message: "The requested post was not found." } }, { status: 404 })
    await prisma.post.delete({ where: { id } })
    revalidateArticleContent(existing.slug)
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "posts.delete")
  }
}
