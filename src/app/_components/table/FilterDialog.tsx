"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Plus, X } from "lucide-react"
import type { Column, ColumnFilter } from "~/types/table"

interface FilterDialogProps {
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

export default function FilterDialog({ isOpen, onClose, columns, filters, onFiltersChange }: FilterDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter Records</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {filters.map((filter) => {
            const column = columns.find((c) => c.id === filter.columnId)
            const operators = getOperators(filter.columnId)
            const needsValue = !["is_empty", "is_not_empty"].includes(filter.operator)

            return (
              <div key={filter.id} className="flex items-center gap-2 p-3 border rounded-lg">
                {/* Column */}
                <Select value={filter.columnId} onValueChange={(value) => updateFilter(filter.id, { columnId: value })}>
                  <SelectTrigger className="w-40">
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

                {/* Operator */}
                <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, { operator: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value */}
                {needsValue && (
                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    type={column?.type === "NUMBER" ? "number" : "text"}
                    className="flex-1"
                  />
                )}

                {/* Remove */}
                <Button variant="ghost" size="sm" onClick={() => removeFilter(filter.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}

          <Button variant="outline" onClick={addFilter} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
