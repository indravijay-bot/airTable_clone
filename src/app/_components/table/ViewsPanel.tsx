"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Plus, Eye } from "lucide-react"
import { api } from "~/trpc/react"
import type { TableView, ColumnFilter, ColumnSort } from "~/types/table"

interface ViewsPanelProps {
  isOpen: boolean
  onClose: () => void
  tableId: string
  currentView: TableView | null
  onViewChange: (view: TableView | null) => void
  filters: ColumnFilter[]
  sorts: ColumnSort[]
  hiddenColumns: string[]
}

export default function ViewsPanel({
  isOpen,
  onClose,
  tableId,
  currentView,
  onViewChange,
  filters,
  sorts,
  hiddenColumns,
}: ViewsPanelProps) {
  const [newViewName, setNewViewName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const { data: views = [] } = api.table.getViews.useQuery({ tableId })
  const utils = api.useContext()

  const createViewMutation = api.table.createView.useMutation({
    onSuccess: () => {
      utils.table.getViews.invalidate({ tableId })
      setIsCreating(false)
      setNewViewName("")
    },
  })

  const deleteViewMutation = api.table.deleteView.useMutation({
    onSuccess: () => {
      utils.table.getViews.invalidate({ tableId })
      if (currentView) {
        onViewChange(null)
      }
    },
  })

  const handleCreateView = () => {
    if (!newViewName.trim()) return

    createViewMutation.mutate({
      tableId,
      name: newViewName.trim(),
      filters,
      sorts,
      hiddenColumns,
    })
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Views</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Views List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {/* Default View */}
          <button
            onClick={() => onViewChange(null)}
            className={`w-full text-left p-2 rounded hover:bg-gray-100 flex items-center gap-2 ${
              !currentView ? "bg-blue-50 border border-blue-200" : ""
            }`}
          >
            <Eye className="h-4 w-4" />
            All Records
          </button>

          {/* Saved Views */}
          {views.map((view) => (
            <div
              key={view.id}
              className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
                currentView?.id === view.id ? "bg-blue-50 border border-blue-200" : ""
              }`}
            >
              <button onClick={() => onViewChange(view)} className="flex-1 text-left flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {view.name}
              </button>
              <Button variant="ghost" size="sm" onClick={() => deleteViewMutation.mutate({ id: view.id })}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Create New View */}
        <div className="mt-4 pt-4 border-t">
          {isCreating ? (
            <div className="space-y-2">
              <Input
                placeholder="View name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateView()
                  if (e.key === "Escape") {
                    setIsCreating(false)
                    setNewViewName("")
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateView}
                  disabled={!newViewName.trim() || createViewMutation.isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false)
                    setNewViewName("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create View
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
