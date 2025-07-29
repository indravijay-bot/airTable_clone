"use client"

import { useMemo, useRef, useEffect } from "react"
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { api } from "~/trpc/react"
import EditableCell from "./EditableCell"
import { Button } from "../ui/button"
import { Plus, Loader2 } from "lucide-react"
import type { Column, Row } from "~/types/table"

interface TableViewProps {
  columns: Column[]
  rows: Row[]
  isLoading: boolean
  onLoadMore: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  hiddenColumns: string[]
  tableId: string
}

export default function TableView({
  columns,
  rows,
  isLoading,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  hiddenColumns,
  tableId,
}: TableViewProps) {
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

    const cols: ColumnDef<Row>[] = visibleColumns.map((column) => ({
      id: column.id,
      header: column.name,
      size: 150,
      cell: ({ row }) => {
        const cell = row.original.cells.find((c) => c.columnId === column.id)
        return <EditableCell cell={cell} column={column} rowId={row.original.id} tableId={tableId} />
      },
    }))

    // Add column for adding new columns
    cols.push({
      id: "add-column",
      header: () => (
        <Button
          variant="ghost"
          size="sm"
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
        >
          {addColumnMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      ),
      size: 60,
      cell: () => null,
    })

    return cols
  }, [columns, hiddenColumns, tableId, addColumnMutation])

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
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

  if (isLoading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Table Header */}
      <div className="border-b bg-gray-50 sticky top-0 z-10">
        <div className="flex">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="border-r border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50"
                style={{ width: header.getSize() }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            )),
          )}
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div ref={parentRef} className="flex-1 overflow-auto" style={{ height: "100%" }}>
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
                className="absolute top-0 left-0 w-full flex border-b border-gray-100 hover:bg-gray-50"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="border-r border-gray-200 px-3 py-2 text-sm"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
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
    </div>
  )
}
