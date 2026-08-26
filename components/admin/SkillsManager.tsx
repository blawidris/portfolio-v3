"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"
import { slugify } from "@/lib/slugify"
import type { Skill, SkillCategory } from "@prisma/client"

type CategoryWithSkills = SkillCategory & { skills: Skill[] }

export default function SkillsManager({ categories: initialCategories }: { categories: CategoryWithSkills[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)
  const [newSkillNames, setNewSkillNames] = useState<Record<string, string>>({})
  const [addingSkillFor, setAddingSkillFor] = useState<string | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [deleteSkill, setDeleteSkill] = useState<{ id: string; categoryId: string } | null>(null)
  const [error, setError] = useState("")

  async function addCategory() {
    setAddingCategory(true)
    setError("")
    try {
      const res = await fetch("/api/admin/skill-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName, slug: slugify(newCategoryName), order: categories.length }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const category = await res.json()
      setCategories((prev) => [...prev, { ...category, skills: [] }])
      setNewCategoryName("")
    } catch {
      setError("The category could not be saved. Check your connection and try again.")
    } finally {
      setAddingCategory(false)
    }
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/admin/skill-categories/${id}`, { method: "DELETE" })
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setDeleteCategoryId(null)
  }

  async function addSkill(categoryId: string) {
    const name = newSkillNames[categoryId]?.trim()
    if (!name) return

    setAddingSkillFor(categoryId)
    setError("")
    try {
      const category = categories.find((c) => c.id === categoryId)
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryId, order: category?.skills.length ?? 0 }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const skill = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, skills: [...c.skills, skill] } : c)))
      setNewSkillNames((prev) => ({ ...prev, [categoryId]: "" }))
    } catch {
      setError("The skill could not be saved. Check your connection and try again.")
    } finally {
      setAddingSkillFor(null)
    }
  }

  async function deleteSkillConfirmed() {
    if (!deleteSkill) return
    await fetch(`/api/admin/skills/${deleteSkill.id}`, { method: "DELETE" })
    setCategories((prev) => prev.map((c) => (
      c.id === deleteSkill.categoryId ? { ...c, skills: c.skills.filter((s) => s.id !== deleteSkill.id) } : c
    )))
    setDeleteSkill(null)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {categories.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No skill categories yet — add one below.</p>
      )}

      {categories.map((category) => (
        <div key={category.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">{category.name}</h3>
            <button
              onClick={() => setDeleteCategoryId(category.id)}
              aria-label={`Delete ${category.name} category`}
              className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {category.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-secondary)]"
              >
                {skill.name}
                <button
                  onClick={() => setDeleteSkill({ id: skill.id, categoryId: category.id })}
                  aria-label={`Delete ${skill.name}`}
                  className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
            {category.skills.length === 0 && (
              <span className="text-xs text-[var(--text-muted)]">No skills in this category yet.</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={newSkillNames[category.id] ?? ""}
              onChange={(e) => setNewSkillNames((prev) => ({ ...prev, [category.id]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addSkill(category.id)}
              className="flex-1 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Add a skill"
            />
            <button
              onClick={() => addSkill(category.id)}
              disabled={addingSkillFor === category.id || !newSkillNames[category.id]?.trim()}
              className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Add Category</h3>
        <div className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Category name, e.g. Infrastructure"
          />
          <button
            onClick={addCategory}
            disabled={addingCategory || !newCategoryName.trim()}
            className="px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <ConfirmModal
        isOpen={!!deleteCategoryId}
        label="this category and its skills"
        onConfirm={() => deleteCategoryId && deleteCategory(deleteCategoryId)}
        onCancel={() => setDeleteCategoryId(null)}
      />
      <ConfirmModal
        isOpen={!!deleteSkill}
        label="this skill"
        onConfirm={deleteSkillConfirmed}
        onCancel={() => setDeleteSkill(null)}
      />
    </div>
  )
}
