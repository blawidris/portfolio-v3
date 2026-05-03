"use client"

interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  label?: string
}

export default function ConfirmModal({ isOpen, onConfirm, onCancel, label = "this item" }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="text-[var(--text-primary)] font-medium mb-2">Delete {label}?</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[var(--text-secondary)] border border-[var(--border)] rounded-md hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
