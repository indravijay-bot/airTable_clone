"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import AirtableView from "~/app/_components/table/AirtableView"
import HideFieldsDropdown from "~/app/_components/table/HideFieldsDropdown"
import FilterDropdown from "~/app/_components/table/FilterDropdown"
import SortDropdown from "~/app/_components/table/SortDropdown"
import TableSkeleton from "~/app/_components/table/TableSkeleton"
import { Loader2, Plus, Database, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { ColumnFilter, ColumnSort, TableView as TableViewType } from "~/types/table"

export default function TablePage() {
  const params = useParams()
  const tableId = params.table as string
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ColumnFilter[]>([])
  const [sorts, setSorts] = useState<ColumnSort[]>([])
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<TableViewType | null>(null)
  const [selectedView, setSelectedView] = useState("Grid view")

  // Dropdown states
  const [showHideFields, setShowHideFields] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [newTableName, setNewTableName] = useState("")
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editingTableName, setEditingTableName] = useState("")

  // UI state
  const [currentTable, setCurrentTable] = useState<any>(null)
  const [currentBase, setCurrentBase] = useState<any>(null)
  const [allTables, setAllTables] = useState<any[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const apiContext = api.useContext()

  // Get table info - only run if tableId exists
  const { data: table, isLoading: tableLoading } = api.table.getById.useQuery(
    { id: tableId },
    {
      enabled: !!tableId,
      onSuccess: (data) => {
        setCurrentTable(data)
      },
    },
  )

  // Get all tables in the base - run immediately when we have baseId
  const { data: tablesData = [] } = api.table.getByBaseId.useQuery(
    { baseId: table?.baseId || currentTable?.baseId || "" },
    {
      enabled: !!(table?.baseId || currentTable?.baseId),
      onSuccess: (data) => {
        setAllTables(data)
      },
    },
  )

  // Get base info for the current table
  const { data: baseData } = api.base.getById.useQuery(
    { id: table?.baseId || currentTable?.baseId || "" },
    {
      enabled: !!(table?.baseId || currentTable?.baseId),
      onSuccess: (data) => {
        setCurrentBase(data)
      },
    },
  )

  // Get table data with filters, sorts, and search - only run if tableId exists
  // Using the optimized getData that includes totalCount from database
  const {
    data: tableData,
    isLoading: dataLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.table.getData.useInfiniteQuery(
    {
      tableId,
      search: searchQuery,
      filters,
      sorts,
      limit: 1000, // Load in chunks of 1000
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!tableId,
    },
  )

  // Create table mutation
  const createTableMutation = api.table.create.useMutation({
    onSuccess: (newTable) => {
      apiContext.table.getByBaseId.invalidate({ baseId: table?.baseId || currentTable?.baseId || "" })
      setShowCreateTable(false)
      setNewTableName("")
      router.push(`/dashboard/table/${newTable.id}`)
    },
  })

  // Update table mutation
  const updateTableMutation = api.table.update.useMutation({
    onSuccess: () => {
      apiContext.table.getByBaseId.invalidate({ baseId: table?.baseId || currentTable?.baseId || "" })
      apiContext.table.getById.invalidate({ id: tableId })
      setEditingTableId(null)
      setEditingTableName("")
    },
  })

  // Add 100k rows mutation
  const add100kRowsMutation = api.table.add100kRows.useMutation({
    onSuccess: () => {
      // Invalidate and refetch data
      apiContext.table.getData.invalidate({ tableId })
      apiContext.table.getById.invalidate({ id: tableId })

      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    },
    onError: (error) => {
      console.error("Failed to add 100k rows:", error)
      alert("Failed to add 100k rows. Please try again.")
    },
  })

  const allRows = useMemo(() => {
    return tableData?.pages.flatMap((page) => page.rows) ?? []
  }, [tableData])

  // Get total count from the first page or table data
  const totalRowCount = tableData?.pages[0]?.totalCount || table?.rowCount

  const columns = table?.columns ?? currentTable?.columns ?? []
  const displayTable = table || currentTable
  const displayTables = tablesData.length > 0 ? tablesData : allTables

  const handleCreateTable = () => {
    if (!newTableName.trim() || !(table?.baseId || currentTable?.baseId)) return
    createTableMutation.mutate({
      name: newTableName.trim(),
      baseId: table?.baseId || currentTable?.baseId || "",
    })
  }

  const handleUpdateTable = (tableId: string) => {
    if (!editingTableName.trim()) return
    updateTableMutation.mutate({
      id: tableId,
      name: editingTableName.trim(),
    })
  }

  const handleAdd100kRows = () => {
    if (confirm("This will add 100,000 rows to your table. This may take 2-3 minutes. Continue?")) {
      add100kRowsMutation.mutate({ tableId })
    }
  }

  // Handle table switching
  const handleTableSwitch = (newTableId: string) => {
    // Update URL immediately for fast navigation
    router.push(`/dashboard/table/${newTableId}`)

    // Find the table in our existing data
    const newTable = displayTables.find((t) => t.id === newTableId)
    if (newTable) {
      setCurrentTable(newTable)
    }
  }

  if (!tableId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Invalid table ID</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Show skeleton while loading
  const showSkeleton = !displayTable || (dataLoading && allRows.length === 0)

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Success notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">100,000 rows added successfully!</p>
              <p className="text-sm text-green-700">
                You can now scroll through all {totalRowCount?.toLocaleString()} rows seamlessly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar - Fixed Height */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">📊</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">
            {displayTable?.name || <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />}
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-8">
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2 text-base">Data</button>
            <button className="text-gray-600 hover:text-gray-900 text-base">Automations</button>
            <button className="text-gray-600 hover:text-gray-900 text-base">Interfaces</button>
            <button className="text-gray-600 hover:text-gray-900 text-base">Forms</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Trial: 14 days left
          </div>
          <button className="text-blue-600 text-sm hover:text-blue-800">See what's new</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700">
            Share
          </button>
        </div>
      </div>

      {/* Secondary Navigation - Tables - Fixed Height */}
      <div className="h-14 bg-gray-50 border-b border-gray-200 flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-6">
          {displayTables.length > 0 ? (
            displayTables.map((t) => (
              <div key={t.id} className="relative">
                {editingTableId === t.id ? (
                  <input
                    type="text"
                    value={editingTableName}
                    onChange={(e) => setEditingTableName(e.target.value)}
                    onBlur={() => handleUpdateTable(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateTable(t.id)
                      if (e.key === "Escape") {
                        setEditingTableId(null)
                        setEditingTableName("")
                      }
                    }}
                    className="px-3 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleTableSwitch(t.id)}
                    onDoubleClick={() => {
                      setEditingTableId(t.id)
                      setEditingTableName(t.name)
                    }}
                    className={`text-sm px-3 py-2 rounded hover:text-gray-900 transition-colors ${
                      t.id === tableId ? "text-gray-900 font-medium border-b-2 border-gray-900 pb-2" : "text-gray-600"
                    }`}
                  >
                    {t.name}
                  </button>
                )}
              </div>
            ))
          ) : (
            // Skeleton for tables loading
            <div className="flex items-center gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          )}

          {/* Create new table */}
          <div className="relative">
            {showCreateTable ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTable()
                    if (e.key === "Escape") {
                      setShowCreateTable(false)
                      setNewTableName("")
                    }
                  }}
                  placeholder="Table name"
                  className="px-3 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreateTable}
                  disabled={!newTableName.trim() || createTableMutation.isLoading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createTableMutation.isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateTable(false)
                    setNewTableName("")
                  }}
                  className="px-3 py-1 text-gray-600 text-sm hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateTable(true)}
                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Tools</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Fixed Width */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create new...
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search all cells..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="px-4">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm bg-blue-50 text-blue-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Grid view
            </button>
          </div>

          {/* Add 100k rows button */}
          <div className="px-4 mt-4">
            <button
              onClick={handleAdd100kRows}
              disabled={add100kRowsMutation.isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded transition-colors"
            >
              {add100kRowsMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {add100kRowsMutation.isLoading ? "Adding 100k rows..." : "Add 100k Rows"}
            </button>
          </div>

          {/* Show loading notification when adding rows */}
          {add100kRowsMutation.isLoading && (
            <div className="px-4 mt-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Processing in batches</p>
                    <p className="text-blue-700 mt-1">Adding 100,000 rows. This will take 2-3 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Table Area - Flexible */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Table Controls - Fixed Height */}
          <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Grid view
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Hide Fields */}
            <div className="relative">
              <button
                onClick={() => setShowHideFields(!showHideFields)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                disabled={!displayTable}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.12 14.12l1.415 1.415M14.12 14.12L15.536 15.536M14.12 14.12l1.414 1.414"
                  />
                </svg>
                Hide fields
              </button>
              {displayTable && (
                <HideFieldsDropdown
                  isOpen={showHideFields}
                  onClose={() => setShowHideFields(false)}
                  columns={columns}
                  hiddenColumns={hiddenColumns}
                  onHiddenColumnsChange={setHiddenColumns}
                />
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded ${
                  filters.length > 0
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                disabled={!displayTable}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter
                {filters.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">{filters.length}</span>
                )}
              </button>
              {displayTable && (
                <FilterDropdown
                  isOpen={showFilter}
                  onClose={() => setShowFilter(false)}
                  columns={columns}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded ${
                  sorts.length > 0
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                disabled={!displayTable}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
                Sort
                {sorts.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">{sorts.length}</span>
                )}
              </button>
              {displayTable && (
                <SortDropdown
                  isOpen={showSort}
                  onClose={() => setShowSort(false)}
                  columns={columns}
                  sorts={sorts}
                  onSortsChange={setSorts}
                />
              )}
            </div>

            <div className="flex-1" />

            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Table Content - Flexible with proper height constraints */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {showSkeleton ? (
              <TableSkeleton />
            ) : (
              <AirtableView
                columns={columns}
                rows={allRows}
                isLoading={dataLoading}
                onLoadMore={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                hiddenColumns={hiddenColumns}
                tableId={tableId}
                isAddingRows={add100kRowsMutation.isLoading}
                totalRowCount={totalRowCount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
