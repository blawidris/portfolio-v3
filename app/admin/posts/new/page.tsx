import PostForm from "@/components/admin/PostForm"

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">New Post</h1>
      <PostForm />
    </div>
  )
}
