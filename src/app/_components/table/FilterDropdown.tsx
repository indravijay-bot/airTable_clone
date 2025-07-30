"use client"

import { useEffect, useRef } from "react"
import { Plus, X } from "lucide-react"
import type { Column, ColumnFilter } from "~/types/table"

interface FilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  columns: Column[]
  filters: ColumnFilter[]
  onFiltersChange: (filters: ColumnFilter[]) => void
}

const TEXT_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "equals", label: "Equals" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
]

const NUMBER_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "greater_than_or_equal", label: "Greater than or equal" },
  { value: "less_than_or_equal", label: "Less than or equal" },
]

export default function FilterDropdown({ isOpen, onClose, columns, filters, onFiltersChange }: FilterDropdownProps) {
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

  const addFilter = () => {
    const newFilter: ColumnFilter = {
      id: Date.now().toString(),
      columnId: columns[0]?.id || "",
      operator: "contains",
      value: "",
    }
    onFiltersChange([...filters, newFilter])
  }

  const updateFilter = (filterId: string, updates: Partial<ColumnFilter>) => {
    onFiltersChange(filters.map((filter) => (filter.id === filterId ? { ...filter, ...updates } : filter)))
  }

  const removeFilter = (filterId: string) => {
    onFiltersChange(filters.filter((filter) => filter.id !== filterId))
  }

  const getOperators = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId)
    return column?.type === "NUMBER" ? NUMBER_OPERATORS : TEXT_OPERATORS
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-50"
    >
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Filter</h3>
        <p className="text-xs text-gray-500 mt-1">Show records that match conditions</p>
      </div>

      <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
        {filters.map((filter) => {
          const column = columns.find((c) => c.id === filter.columnId)
          const operators = getOperators(filter.columnId)
          const needsValue = !["is_empty", "is_not_empty"].includes(filter.operator)

          return (
            <div key={filter.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
              {/* Column */}
              <select
                value={filter.columnId}
                onChange={(e) => updateFilter(filter.id, { columnId: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>

              {/* Operator */}
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {/* Value */}
              {needsValue && (
                <input
                  type={column?.type === "NUMBER" ? "number" : "text"}
                  placeholder="Value"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {/* Remove */}
              <button
                onClick={() => removeFilter(filter.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            </div>
          )
        })}

        <button
          onClick={addFilter}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add condition
        </button>
      </div>
    </div>
  )
}
