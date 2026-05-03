import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const link = await prisma.footerLink.update({ where: { id }, data: body })
  return Response.json(link)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.footerLink.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
