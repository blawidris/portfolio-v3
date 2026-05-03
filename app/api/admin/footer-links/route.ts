import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const links = await prisma.footerLink.findMany({ orderBy: { order: "asc" } })
  return Response.json(links)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const link = await prisma.footerLink.create({ data: body })
  return Response.json(link, { status: 201 })
}
