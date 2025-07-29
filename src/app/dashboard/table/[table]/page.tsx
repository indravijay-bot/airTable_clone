"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { api } from "~/trpc/react"
import TableView from "~/app/_components/table/TableView"
import TableHeader from "~/app/_components/table/TableHeader"
import ViewsPanel from "~/app/_components/table/ViewsPanel"
import { Button } from "~/app/_components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { ColumnFilter, ColumnSort, TableView as TableViewType } from "~/types/table"

export default function TablePage() {
  const params = useParams()
//const tableId = params.tableId as string

  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ColumnFilter[]>([])
  const [sorts, setSorts] = useState<ColumnSort[]>([])
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<TableViewType | null>(null)
  const [isViewsPanelOpen, setIsViewsPanelOpen] = useState(false)

  const apiContext = api.useContext()
  // Get table info
  const tableId = typeof params.table === "string" ? params.table : undefined
        console.log(params);

const { data: table, isLoading: tableLoading } = api.table.getById.useQuery(
  { id: tableId! }, // Only safe because of enabled below
  { enabled: !!tableId }
)

  // Get table data with filters, sorts, and search
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

  // Add 100k rows mutation
  const add100kRowsMutation = api.table.add100kRows.useMutation({
    onSuccess: () => {
      // Invalidate and refetch table data
      apiContext.table.getData.invalidate({ tableId })
    },
  })

  const handleAdd100kRows = () => {
    add100kRowsMutation.mutate({ tableId })
  }

  const allRows = useMemo(() => {
    return tableData?.pages.flatMap((page) => page.rows) ?? []
  }, [tableData])

  const columns = table?.columns ?? []

  if (tableLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!table) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Table not found</h2>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Views Panel */}
      <ViewsPanel
        isOpen={isViewsPanelOpen}
        onClose={() => setIsViewsPanelOpen(false)}
        tableId={tableId}
        currentView={currentView}
        onViewChange={setCurrentView}
        filters={filters}
        sorts={sorts}
        hiddenColumns={hiddenColumns}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TableHeader
          table={table}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onViewsToggle={() => setIsViewsPanelOpen(!isViewsPanelOpen)}
          filters={filters}
          sorts={sorts}
          onFiltersChange={setFilters}
          onSortsChange={setSorts}
          hiddenColumns={hiddenColumns}
          onHiddenColumnsChange={setHiddenColumns}
          columns={columns}
        />

        {/* Action Bar */}
        <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="flex-1" />

          <Button onClick={handleAdd100kRows} disabled={add100kRowsMutation.isLoading} variant="outline" size="sm">
            {add100kRowsMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding 100k rows...
              </>
            ) : (
              "Add 100k Rows"
            )}
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <TableView
            columns={columns}
            rows={allRows}
            isLoading={dataLoading}
            onLoadMore={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hiddenColumns={hiddenColumns}
            tableId={tableId}
          />
        </div>
      </div>
    </div>
  )
}
