"use client"

import type React from "react"
import { Database, Trash2 } from "lucide-react"
import type { Base } from "~/app/dashboard/types"

type Props = {
  base: Base
  onClick: () => void
  onDelete: (baseId: string) => void
  isDeleting?: boolean
}

export default function BaseCard({ base, onClick, onDelete, isDeleting = false }: Props) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDeleting) {
      onDelete(base.id)
    }
  }

  const handleCardClick = () => {
    if (!isDeleting) {
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDeleting && (e.key === "Enter" || e.key === " ")) {
      onClick()
    }
  }

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`relative rounded border border-gray-300 bg-white p-4 shadow-sm transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isDeleting ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:shadow-md"
      }`}
      role="button"
      tabIndex={isDeleting ? -1 : 0}
    >
      {/* Delete button - top right */}
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className={`absolute top-2 right-2 flex items-center space-x-1 rounded px-2 py-1 text-sm font-semibold transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none ${
          isDeleting ? "text-red-400 bg-red-50 cursor-not-allowed opacity-50" : "text-red-600 hover:bg-red-100"
        }`}
        aria-label={`Delete base ${base.name}`}
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? <span>Deleting...</span> : null}
      </button>

      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <Database className="h-5 w-5 text-blue-600" />
        <span>{base.name}</span>
      </div>
      <p className="mt-1 text-gray-600">{base.description}</p>
    </div>
  )
}
