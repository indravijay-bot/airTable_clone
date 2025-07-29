"use client"

import { useState } from "react"
import { Search, Filter, Eye, ChevronDown } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../ui/dropdown-menu"
import FilterDialog from "./FilterDialog"
import SortDialog from "./SortDialog"
import type { Table, Column, ColumnFilter, ColumnSort } from "~/types/table"

interface TableHeaderProps {
  table: Table
  searchQuery: string
  onSearchChange: (query: string) => void
  onViewsToggle: () => void
  filters: ColumnFilter[]
  sorts: ColumnSort[]
  onFiltersChange: (filters: ColumnFilter[]) => void
  onSortsChange: (sorts: ColumnSort[]) => void
  hiddenColumns: string[]
  onHiddenColumnsChange: (columns: string[]) => void
  columns: Column[]
}

export default function TableHeader({
  table,
  searchQuery,
  onSearchChange,
  onViewsToggle,
  filters,
  sorts,
  onFiltersChange,
  onSortsChange,
  hiddenColumns,
  onHiddenColumnsChange,
  columns,
}: TableHeaderProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false)

  const toggleColumnVisibility = (columnId: string) => {
    if (hiddenColumns.includes(columnId)) {
      onHiddenColumnsChange(hiddenColumns.filter((id) => id !== columnId))
    } else {
      onHiddenColumnsChange([...hiddenColumns, columnId])
    }
  }

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{table.name}</h1>
          <Button variant="ghost" size="sm" onClick={onViewsToggle}>
            Views
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search all cells..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterDialogOpen(true)}
          className={filters.length > 0 ? "bg-blue-50 border-blue-200" : ""}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {filters.length > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">{filters.length}</span>
          )}
        </Button>

        {/* Sort */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSortDialogOpen(true)}
          className={sorts.length > 0 ? "bg-blue-50 border-blue-200" : ""}
        >
          Sort
          {sorts.length > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">{sorts.length}</span>
          )}
        </Button>

        {/* Hide/Show Columns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Columns
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={!hiddenColumns.includes(column.id)}
                onCheckedChange={() => toggleColumnVisibility(column.id)}
              >
                {column.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialogs */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        columns={columns}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <SortDialog
        isOpen={isSortDialogOpen}
        onClose={() => setIsSortDialogOpen(false)}
        columns={columns}
        sorts={sorts}
        onSortsChange={onSortsChange}
      />
    </div>
  )
}
