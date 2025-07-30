"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import AirtableView from "~/app/_components/table/AirtableView"
import HideFieldsDropdown from "~/app/_components/table/HideFieldsDropdown"
import FilterDropdown from "~/app/_components/table/FilterDropdown"
import SortDropdown from "~/app/_components/table/SortDropdown"
import TableSkeleton from "~/app/_components/table/TableSkeleton"
import { Loader2, Plus } from "lucide-react"
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
      limit: 50,
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

  const allRows = useMemo(() => {
    return tableData?.pages.flatMap((page) => page.rows) ?? []
  }, [tableData])

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

  // Show UI immediately with skeleton if we don't have table data yet
  const showSkeleton = !displayTable || dataLoading

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">📊</span>
          </div>
          <span className="font-medium text-gray-900">
            {displayTable?.name || <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-8">
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">Data</button>
            <button className="text-gray-600 hover:text-gray-900">Automations</button>
            <button className="text-gray-600 hover:text-gray-900">Interfaces</button>
            <button className="text-gray-600 hover:text-gray-900">Forms</button>
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
          <button className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-purple-700">
            Share
          </button>
        </div>
      </div>

      {/* Secondary Navigation - Tables */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4">
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
                    className="px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleTableSwitch(t.id)}
                    onDoubleClick={() => {
                      setEditingTableId(t.id)
                      setEditingTableName(t.name)
                    }}
                    className={`text-sm px-2 py-1 rounded hover:text-gray-900 ${
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
                <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
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
                  className="px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreateTable}
                  disabled={!newTableName.trim() || createTableMutation.isLoading}
                  className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createTableMutation.isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateTable(false)
                    setNewTableName("")
                  }}
                  className="px-2 py-1 text-gray-600 text-sm hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateTable(true)}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
                placeholder="Find a view"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
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
        </div>

        {/* Main Table Area */}
        <div className="flex-1 flex flex-col">
          {/* Table Controls */}
          <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
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

            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Group
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h16a2 2 0 002-2v-4a2 2 0 00-2-2H7m0-9h16a2 2 0 012 2v4a2 2 0 01-2 2H7m0-9V5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H7"
                />
              </svg>
              Color
            </button>

            <div className="flex-1" />

            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share and sync
            </button>

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

          {/* Table Content */}
          {showSkeleton ? (
            <TableSkeleton />
          ) : (
            <AirtableView
              columns={columns}
              rows={allRows}
              isLoading={false}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              hiddenColumns={hiddenColumns}
              tableId={tableId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
