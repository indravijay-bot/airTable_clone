"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { api } from "~/trpc/react"
import type { Cell, Column } from "~/types/table"

interface EditableCellProps {
  cell?: Cell
  column: Column
  rowId: string
  tableId: string
}

export default function EditableCell({ cell, column, rowId, tableId }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(cell?.value || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const utils = api.useContext()

  // Update cell mutation
  const updateCellMutation = api.table.updateCell.useMutation({
    onSuccess: () => {
      utils.table.getData.invalidate({ tableId })
    },
  })

  useEffect(() => {
    setValue(cell?.value || "")
  }, [cell?.value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (value !== (cell?.value || "")) {
      updateCellMutation.mutate({
        rowId,
        columnId: column.id,
        value: value || null,
      })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setValue(cell?.value || "")
      setIsEditing(false)
    } else if (e.key === "Tab") {
      handleSave()
    }
  }

  // Render status badges for status-like columns
  const renderStatusBadge = (value: string) => {
    const statusColors: Record<string, string> = {
      "In Progress": "bg-blue-100 text-blue-800",
      "Not Started": "bg-gray-100 text-gray-800",
      Completed: "bg-green-100 text-green-800",
      "On Hold": "bg-yellow-100 text-yellow-800",
    }

    if (statusColors[value]) {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
          {value}
        </span>
      )
    }
    return value
  }

  // Format currency values
  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value)
    if (!isNaN(num)) {
      return `$${num.toLocaleString()}`
    }
    return value
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={column.type === "NUMBER" ? "number" : "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full h-full border-none outline-none bg-transparent text-sm"
      />
    )
  }

  const displayValue = value || ""
  const isStatus = column.name.toLowerCase().includes("status")
  const isCurrency =
    column.type === "NUMBER" &&
    (column.name.toLowerCase().includes("budget") || column.name.toLowerCase().includes("amount"))

  return (
    <div
      className="w-full h-full cursor-text flex items-center text-sm"
      onClick={() => setIsEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setIsEditing(true)
        }
      }}
    >
      {displayValue ? (
        isStatus ? (
          renderStatusBadge(displayValue)
        ) : isCurrency ? (
          formatCurrency(displayValue)
        ) : (
          displayValue
        )
      ) : (
        <span className="text-gray-400 italic">Empty</span>
      )}
    </div>
  )
}
