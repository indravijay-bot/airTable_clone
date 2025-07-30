"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { api } from "~/trpc/react"
import type { Cell, Column } from "~/types/table"

interface EditableCellProps {
  cell?: Cell
  column: Column
  rowId: string
  tableId: string
  rowIndex: number
  colIndex: number
}

export default function EditableCell({ cell, column, rowId, tableId, rowIndex, colIndex }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(cell?.value || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const cellRef = useRef<HTMLDivElement>(null)
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

  const handleSave = useCallback(() => {
    if (value !== (cell?.value || "")) {
      updateCellMutation.mutate({
        rowId,
        columnId: column.id,
        value: value || null,
      })
    }
    setIsEditing(false)
  }, [value, cell?.value, updateCellMutation, rowId, column.id])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSave()
        // Move to next row
        const nextCell = document.querySelector(`[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`) as HTMLElement
        if (nextCell) {
          nextCell.click()
        }
      } else if (e.key === "Escape") {
        setValue(cell?.value || "")
        setIsEditing(false)
      } else if (e.key === "Tab") {
        e.preventDefault()
        handleSave()
        // Move to next column or next row first column
        const nextColIndex = colIndex + 1
        let nextCell = document.querySelector(`[data-row="${rowIndex}"][data-col="${nextColIndex}"]`) as HTMLElement
        if (!nextCell) {
          // Move to first column of next row
          nextCell = document.querySelector(`[data-row="${rowIndex + 1}"][data-col="0"]`) as HTMLElement
        }
        if (nextCell) {
          setTimeout(() => nextCell.click(), 0)
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        handleSave()
        const prevCell = document.querySelector(`[data-row="${rowIndex - 1}"][data-col="${colIndex}"]`) as HTMLElement
        if (prevCell) {
          prevCell.click()
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        handleSave()
        const nextCell = document.querySelector(`[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`) as HTMLElement
        if (nextCell) {
          nextCell.click()
        }
      } else if (e.key === "ArrowLeft" && !isEditing) {
        e.preventDefault()
        const prevCell = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex - 1}"]`) as HTMLElement
        if (prevCell) {
          prevCell.click()
        }
      } else if (e.key === "ArrowRight" && !isEditing) {
        e.preventDefault()
        const nextCell = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex + 1}"]`) as HTMLElement
        if (nextCell) {
          nextCell.click()
        }
      }
    },
    [handleSave, cell?.value, rowIndex, colIndex, isEditing],
  )

  // Render status badges for status-like columns
  const renderStatusBadge = (value: string) => {
    const statusColors: Record<string, string> = {
      Checking: "bg-blue-100 text-blue-800",
      Savings: "bg-green-100 text-green-800",
      Credit: "bg-red-100 text-red-800",
      Investment: "bg-purple-100 text-purple-800",
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
        className="w-full h-full border-none outline-none bg-white text-sm px-1 py-1 rounded"
        style={{ minHeight: "32px" }}
      />
    )
  }

  const displayValue = value || ""
  const isAccountType = column.name.toLowerCase().includes("type")
  const isCurrency =
    column.type === "NUMBER" &&
    (column.name.toLowerCase().includes("balance") || column.name.toLowerCase().includes("amount"))

  return (
    <div
      ref={cellRef}
      data-row={rowIndex}
      data-col={colIndex}
      className="w-full h-full cursor-text flex items-center text-sm min-h-[32px] px-1 py-1 rounded hover:bg-gray-50"
      onClick={() => setIsEditing(true)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {displayValue ? (
        isAccountType ? (
          renderStatusBadge(displayValue)
        ) : isCurrency ? (
          <span className="font-mono">{formatCurrency(displayValue)}</span>
        ) : (
          displayValue
        )
      ) : (
        <span className="text-gray-400 italic">Empty</span>
      )}
    </div>
  )
}
