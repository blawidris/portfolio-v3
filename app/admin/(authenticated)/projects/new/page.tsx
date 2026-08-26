import ProjectForm from "@/components/admin/ProjectForm"

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">New Project</h1>
      <ProjectForm />
    </div>
  )
}
