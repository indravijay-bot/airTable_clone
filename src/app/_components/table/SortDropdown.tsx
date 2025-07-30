"use client"

import { useEffect, useRef } from "react"
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import type { Column, ColumnSort } from "~/types/table"

interface SortDropdownProps {
  isOpen: boolean
  onClose: () => void
  columns: Column[]
  sorts: ColumnSort[]
  onSortsChange: (sorts: ColumnSort[]) => void
}

export default function SortDropdown({ isOpen, onClose, columns, sorts, onSortsChange }: SortDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const addSort = () => {
    const newSort: ColumnSort = {
      id: Date.now().toString(),
      columnId: columns[0]?.id || "",
      direction: "asc",
    }
    onSortsChange([...sorts, newSort])
  }

  const updateSort = (sortId: string, updates: Partial<ColumnSort>) => {
    onSortsChange(sorts.map((sort) => (sort.id === sortId ? { ...sort, ...updates } : sort)))
  }

  const removeSort = (sortId: string) => {
    onSortsChange(sorts.filter((sort) => sort.id !== sortId))
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50"
    >
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Sort</h3>
        <p className="text-xs text-gray-500 mt-1">Choose how to sort your records</p>
      </div>

      <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
        {sorts.map((sort, index) => (
          <div key={sort.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
            <span className="text-xs text-gray-500 w-4">{index + 1}</span>

            {/* Column */}
            <select
              value={sort.columnId}
              onChange={(e) => updateSort(sort.id, { columnId: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>

            {/* Direction */}
            <button
              onClick={() =>
                updateSort(sort.id, {
                  direction: sort.direction === "asc" ? "desc" : "asc",
                })
              }
              className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {sort.direction === "asc" ? (
                <ArrowUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-gray-600" />
              )}
            </button>

            {/* Remove */}
            <button onClick={() => removeSort(sort.id)} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        ))}

        <button
          onClick={addSort}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add sort
        </button>
      </div>
    </div>
  )
}
