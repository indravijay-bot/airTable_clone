"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { api } from "~/trpc/react"

interface AddColumnModalProps {
  isOpen: boolean
  onClose: () => void
  tableId: string
}

export default function AddColumnModal({ isOpen, onClose, tableId }: AddColumnModalProps) {
  const [columnName, setColumnName] = useState("")
  const [columnType, setColumnType] = useState<"TEXT" | "NUMBER">("TEXT")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const utils = api.useContext()

  const addColumnMutation = api.table.addColumn.useMutation({
    onSuccess: () => {
      utils.table.getById.invalidate({ id: tableId })
      utils.table.getData.invalidate({ tableId })
      handleClose()
    },
    onError: (error) => {
      console.error("Failed to add column:", error)
    },
  })

  const handleClose = () => {
    setColumnName("")
    setColumnType("TEXT")
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!columnName.trim()) return

    setIsSubmitting(true)
    addColumnMutation.mutate({
      tableId,
      name: columnName.trim(),
      type: columnType,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Column</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Column Name */}
          <div>
            <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-2">
              Column Name
            </label>
            <input
              id="columnName"
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Column Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Column Type</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="columnType"
                  value="TEXT"
                  checked={columnType === "TEXT"}
                  onChange={(e) => setColumnType(e.target.value as "TEXT" | "NUMBER")}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">Text</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="columnType"
                  value="NUMBER"
                  checked={columnType === "NUMBER"}
                  onChange={(e) => setColumnType(e.target.value as "TEXT" | "NUMBER")}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">Number</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!columnName.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Column
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
