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
      // Let the default tab behavior handle focus movement
    }
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
        className="w-full h-full border-none outline-none bg-transparent"
      />
    )
  }

  return (
    <div
      className="w-full h-full cursor-text flex items-center"
      onClick={() => setIsEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setIsEditing(true)
        }
      }}
    >
      {value || <span className="text-gray-400 italic">Empty</span>}
    </div>
  )
}
