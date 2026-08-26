import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { postInputSchema } from "@/lib/validation/posts"
import { revalidateArticleContent } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } })
  return Response.json(posts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = postInputSchema.parse(await parseJsonRequest(req))
    const post = await prisma.post.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        content: input.content,
        tags: input.tags,
        readingTime: input.readingTime,
        published: input.published,
      },
    })
    revalidateArticleContent(post.slug)
    return Response.json(post, { status: 201 })
  } catch (error) {
    return handleApiError(error, "posts.create")
  }
}
