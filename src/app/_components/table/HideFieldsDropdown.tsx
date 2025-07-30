"use client"

import { useEffect, useRef } from "react"
import type { Column } from "~/types/table"

interface HideFieldsDropdownProps {
  isOpen: boolean
  onClose: () => void
  columns: Column[]
  hiddenColumns: string[]
  onHiddenColumnsChange: (columns: string[]) => void
}

export default function HideFieldsDropdown({
  isOpen,
  onClose,
  columns,
  hiddenColumns,
  onHiddenColumnsChange,
}: HideFieldsDropdownProps) {
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

  const toggleColumnVisibility = (columnId: string) => {
    if (hiddenColumns.includes(columnId)) {
      onHiddenColumnsChange(hiddenColumns.filter((id) => id !== columnId))
    } else {
      onHiddenColumnsChange([...hiddenColumns, columnId])
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50"
    >
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Hide fields</h3>
        <p className="text-xs text-gray-500 mt-1">Choose which fields to show or hide</p>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {columns.map((column) => (
          <label key={column.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={!hiddenColumns.includes(column.id)}
              onChange={() => toggleColumnVisibility(column.id)}
              className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-700">{column.name}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
