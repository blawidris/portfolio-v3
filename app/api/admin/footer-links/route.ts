import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { footerLinkInputSchema } from "@/lib/validation/footer-links"
import { revalidateFooterLinks } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const links = await prisma.footerLink.findMany({ orderBy: { order: "asc" } })
  return Response.json(links)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = footerLinkInputSchema.parse(await parseJsonRequest(req))
    const link = await prisma.footerLink.create({
      data: { label: input.label, url: input.url, icon: input.icon, order: input.order },
    })
    revalidateFooterLinks()
    return Response.json(link, { status: 201 })
  } catch (error) {
    return handleApiError(error, "footer-links.create")
  }
}
