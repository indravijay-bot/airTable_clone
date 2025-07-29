"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import type { Column, ColumnSort } from "~/types/table"

interface SortDialogProps {
  isOpen: boolean
  onClose: () => void
  columns: Column[]
  sorts: ColumnSort[]
  onSortsChange: (sorts: ColumnSort[]) => void
}

export default function SortDialog({ isOpen, onClose, columns, sorts, onSortsChange }: SortDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sort Records</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sorts.map((sort) => (
            <div key={sort.id} className="flex items-center gap-2 p-3 border rounded-lg">
              {/* Column */}
              <Select value={sort.columnId} onValueChange={(value) => updateSort(sort.id, { columnId: value })}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Direction */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSort(sort.id, {
                    direction: sort.direction === "asc" ? "desc" : "asc",
                  })
                }
              >
                {sort.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>

              {/* Remove */}
              <Button variant="ghost" size="sm" onClick={() => removeSort(sort.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addSort} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Sort
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Apply Sorts</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
