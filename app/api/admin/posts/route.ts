import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } })
  return Response.json(posts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const post = await prisma.post.create({ data: body })
  revalidateTag("posts", "default")
  return Response.json(post, { status: 201 })
}
