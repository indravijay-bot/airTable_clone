"use client"

import { useMemo, useRef, useEffect } from "react"
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { api } from "~/trpc/react"
import EditableCell from "./EditableCell"
import { Plus, Loader2 } from "lucide-react"
import type { Column, Row } from "~/types/table"

interface AirtableViewProps {
  columns: Column[]
  rows: Row[]
  isLoading: boolean
  onLoadMore: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  hiddenColumns: string[]
  tableId: string
}

export default function AirtableView({
  columns,
  rows,
  isLoading,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  hiddenColumns,
  tableId,
}: AirtableViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const utils = api.useContext()

  // Add column mutation
  const addColumnMutation = api.table.addColumn.useMutation({
    onSuccess: () => {
      utils.table.getById.invalidate({ id: tableId })
      utils.table.getData.invalidate({ tableId })
    },
  })

  // Create table columns
  const tableColumns = useMemo<ColumnDef<Row>[]>(() => {
    const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.id))

    const cols: ColumnDef<Row>[] = [
      // Row number column
      {
        id: "row-number",
        header: "",
        size: 40,
        cell: ({ row }) => <div className="text-xs text-gray-400 text-center">{row.index + 1}</div>,
      },
      ...visibleColumns.map((column) => ({
        id: column.id,
        header: () => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{column.name}</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ),
        size: column.name === "Project Name" ? 300 : 150,
        cell: ({ row }) => {
          const cell = row.original.cells.find((c) => c.columnId === column.id)
          return <EditableCell cell={cell} column={column} rowId={row.original.id} tableId={tableId} />
        },
      })),
    ]

    return cols
  }, [columns, hiddenColumns, tableId])

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 10,
  })

  // Load more when scrolling near bottom
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()

    if (!lastItem) return

    if (lastItem.index >= rows.length - 1 && hasNextPage && !isFetchingNextPage) {
      onLoadMore()
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rowVirtualizer.getVirtualItems(), rows.length])

  // Calculate total budget
  const totalBudget = rows.reduce((sum, row) => {
    const budgetCell = row.cells.find((cell) => {
      const column = columns.find((col) => col.id === cell.columnId)
      return column?.name === "Amount" || column?.type === "NUMBER"
    })
    const value = budgetCell?.value ? Number.parseFloat(budgetCell.value) : 0
    return sum + (isNaN(value) ? 0 : value)
  }, 0)

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="flex">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="border-r border-gray-200 px-3 py-2 text-sm bg-gray-50 flex items-center"
                style={{ width: header.getSize() }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            )),
          )}
          {/* Add column button */}
          <div className="w-12 border-r border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-center">
            <button
              onClick={() => {
                const name = prompt("Column name:")
                const type = confirm("Number type? (Cancel for Text)") ? "NUMBER" : "TEXT"
                if (name) {
                  addColumnMutation.mutate({
                    tableId,
                    name,
                    type: type as "TEXT" | "NUMBER",
                  })
                }
              }}
              disabled={addColumnMutation.isLoading}
              className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            >
              {addColumnMutation.isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index]
            if (!row) return null

            return (
              <div
                key={row.id}
                className="absolute top-0 left-0 w-full flex border-b border-gray-100 hover:bg-blue-50 group"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="border-r border-gray-200 px-3 py-2 text-sm flex items-center"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
                {/* Empty cell for add column */}
                <div className="w-12 border-r border-gray-200 px-3 py-2" />
              </div>
            )
          })}
        </div>

        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {/* Footer with summary */}
      <div className="h-10 bg-gray-50 border-t border-gray-200 flex items-center px-4 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:text-gray-900">
            <Plus className="h-4 w-4" />
            Add...
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <span>{rows.length} records</span>
          <span>Sum ${totalBudget.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
