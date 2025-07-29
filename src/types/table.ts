export interface Column {
  id: string
  name: string
  type: "TEXT" | "NUMBER"
  order: number
  tableId: string
}

export interface Row {
  id: string
  tableId: string
  cells: Cell[]
}

export interface Cell {
  id: string
  rowId: string
  columnId: string
  value: string | null
}

export interface Table {
  id: string
  name: string
  baseId: string
  columns: Column[]
}

export interface ColumnFilter {
  id: string
  columnId: string
  operator: string
  value: string
}

export interface ColumnSort {
  id: string
  columnId: string
  direction: "asc" | "desc"
}

export interface TableView {
  id: string
  name: string
  tableId: string
  filters: ColumnFilter[]
  sorts: ColumnSort[]
  hiddenColumns: string[]
}
