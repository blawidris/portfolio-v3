import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PostForm from "@/components/admin/PostForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Edit Post</h1>
      <PostForm id={post.id} initialData={post} />
    </div>
  )
}
