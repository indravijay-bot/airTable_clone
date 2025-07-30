"use client"

import { useMemo, useRef, useState, useCallback, useEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import EditableCell from "./EditableCell"
import AddColumnModal from "./AddColumnModal"
import { Plus, Loader2 } from "lucide-react"
import { api } from "~/trpc/react"
import type { Column, Row } from "~/types/table"

// Skeleton cell component
const SkeletonCell = ({ width }: { width: number }) => (
  <div className="flex items-center px-4 py-3" style={{ width }}>
    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 60 + 40}%` }} />
  </div>
)

interface AirtableViewProps {
  columns: Column[]
  rows: Row[]
  isLoading: boolean
  onLoadMore: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  hiddenColumns: string[]
  tableId: string
  isAddingRows?: boolean
  totalRowCount?: number
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
  isAddingRows = false,
  totalRowCount,
}: AirtableViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)

  // Persistent data cache - survives re-renders and range changes
  const [dataCache, setDataCache] = useState<Map<number, Row>>(new Map())
  const [loadedRanges, setLoadedRanges] = useState<Set<string>>(new Set())
  const [backgroundLoadQueue, setBackgroundLoadQueue] = useState<string[]>([])
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false)

  // Get table info to get the actual row count from database
  const { data: table } = api.table.getById.useQuery({ id: tableId })
  const actualTotalRows = table?.rowCount || totalRowCount || rows.length

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => !hiddenColumns.includes(col.id))
  }, [columns, hiddenColumns])

  // Virtualization based on actual row count from database
  const rowVirtualizer = useVirtualizer({
    count: actualTotalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 50,
  })

  // Get visible range
  const virtualItems = rowVirtualizer.getVirtualItems()
  const firstVisibleIndex = virtualItems[0]?.index || 0
  const lastVisibleIndex = virtualItems[virtualItems.length - 1]?.index || 0

  // Calculate the range we need to load with buffer
  const bufferSize = 200
  const loadStartIndex = Math.max(0, firstVisibleIndex - bufferSize)
  const loadEndIndex = Math.min(actualTotalRows - 1, lastVisibleIndex + bufferSize)

  // Create range key for caching
  const getRangeKey = useCallback((start: number, end: number) => {
    const chunkSize = 500
    const startChunk = Math.floor(start / chunkSize)
    const endChunk = Math.floor(end / chunkSize)
    return `${startChunk}-${endChunk}`
  }, [])

  const currentRangeKey = getRangeKey(loadStartIndex, loadEndIndex)

  // Check if current range needs loading
  const needsCurrentRange = !loadedRanges.has(currentRangeKey)

  // Load data for the current visible range (priority)
  const { data: currentRangeData, isLoading: currentRangeLoading } = api.table.getDataByRange.useQuery(
    {
      tableId,
      startIndex: loadStartIndex,
      endIndex: loadEndIndex,
    },
    {
      enabled: !!tableId && actualTotalRows > 0 && virtualItems.length > 0 && needsCurrentRange,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      refetchOnWindowFocus: false,
    },
  )

  // Background loading for next range in queue
  const nextRangeToLoad = backgroundLoadQueue[0]
  const shouldLoadBackground = nextRangeToLoad && !loadedRanges.has(nextRangeToLoad) && !currentRangeLoading

  // Parse range key to get start/end indices
  const parseRangeKey = useCallback(
    (rangeKey: string) => {
      const [startChunk, endChunk] = rangeKey.split("-").map(Number)
      const chunkSize = 500
      return {
        startIndex: startChunk * chunkSize,
        endIndex: Math.min((endChunk + 1) * chunkSize - 1, actualTotalRows - 1),
      }
    },
    [actualTotalRows],
  )

  const backgroundRange = nextRangeToLoad ? parseRangeKey(nextRangeToLoad) : null

  // Background loading query
  const { data: backgroundRangeData, isLoading: backgroundRangeLoading } = api.table.getDataByRange.useQuery(
    {
      tableId,
      startIndex: backgroundRange?.startIndex || 0,
      endIndex: backgroundRange?.endIndex || 0,
    },
    {
      enabled: !!tableId && shouldLoadBackground && !!backgroundRange,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  // Initialize background loading queue
  useEffect(() => {
    if (actualTotalRows > 0 && backgroundLoadQueue.length === 0) {
      const chunkSize = 500
      const totalChunks = Math.ceil(actualTotalRows / chunkSize)
      const allRanges: string[] = []

      // Create all possible range keys
      for (let i = 0; i < totalChunks; i++) {
        const rangeKey = `${i}-${i}`
        allRanges.push(rangeKey)
      }

      // Prioritize ranges around current view, then add others
      const currentChunk = Math.floor(firstVisibleIndex / chunkSize)
      const prioritizedRanges = [
        ...allRanges.filter((key) => {
          const chunk = Number.parseInt(key.split("-")[0])
          return Math.abs(chunk - currentChunk) <= 2 // Load nearby chunks first
        }),
        ...allRanges.filter((key) => {
          const chunk = Number.parseInt(key.split("-")[0])
          return Math.abs(chunk - currentChunk) > 2
        }),
      ]

      setBackgroundLoadQueue(prioritizedRanges)
    }
  }, [actualTotalRows, firstVisibleIndex, backgroundLoadQueue.length])

  // Update cache when current range data arrives
  useEffect(() => {
    if (currentRangeData?.rows && currentRangeData.rows.length > 0) {
      setDataCache((prevCache) => {
        const newCache = new Map(prevCache)
        currentRangeData.rows.forEach((row, relativeIndex) => {
          const absoluteIndex = loadStartIndex + relativeIndex
          newCache.set(absoluteIndex, row)
        })
        return newCache
      })

      setLoadedRanges((prev) => new Set([...prev, currentRangeKey]))
    }
  }, [currentRangeData, loadStartIndex, currentRangeKey])

  // Update cache when background range data arrives
  useEffect(() => {
    if (backgroundRangeData?.rows && backgroundRangeData.rows.length > 0 && backgroundRange) {
      setDataCache((prevCache) => {
        const newCache = new Map(prevCache)
        backgroundRangeData.rows.forEach((row, relativeIndex) => {
          const absoluteIndex = backgroundRange.startIndex + relativeIndex
          newCache.set(absoluteIndex, row)
        })
        return newCache
      })

      setLoadedRanges((prev) => new Set([...prev, nextRangeToLoad!]))

      // Remove completed range from queue
      setBackgroundLoadQueue((prev) => prev.slice(1))
    }
  }, [backgroundRangeData, backgroundRange, nextRangeToLoad])

  // Track background loading state
  useEffect(() => {
    setIsBackgroundLoading(backgroundLoadQueue.length > 0 && !backgroundRangeLoading)
  }, [backgroundLoadQueue.length, backgroundRangeLoading])

  // Initialize cache with existing rows data
  useEffect(() => {
    if (rows.length > 0) {
      setDataCache((prevCache) => {
        const newCache = new Map(prevCache)
        rows.forEach((row, index) => {
          newCache.set(index, row)
        })
        return newCache
      })
    }
  }, [rows])

  // Calculate total balance from loaded rows
  const totalBalance = useMemo(() => {
    return Array.from(dataCache.values()).reduce((sum, row) => {
      const balanceCell = row.cells.find((cell) => {
        const column = columns.find((col) => col.id === cell.columnId)
        return (
          column?.name === "Account Balance" ||
          (column?.type === "NUMBER" && column?.name.toLowerCase().includes("balance"))
        )
      })
      const value = balanceCell?.value ? Number.parseFloat(balanceCell.value) : 0
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
  }, [dataCache, columns])

  // Calculate column widths
  const getColumnWidth = (columnName: string): number => {
    switch (columnName.toLowerCase()) {
      case "person name":
        return 200
      case "account balance":
        return 150
      case "bank name":
        return 180
      case "account type":
        return 140
      default:
        return 160
    }
  }

  // Calculate total table width
  const totalTableWidth = visibleColumns.reduce((sum, col) => sum + getColumnWidth(col.name), 0) + 60

  // Calculate loading progress
  const totalRanges = Math.ceil(actualTotalRows / 500)
  const loadedRangeCount = loadedRanges.size
  const loadingProgress = totalRanges > 0 ? (loadedRangeCount / totalRanges) * 100 : 0

  // Show skeleton while adding rows OR while initially loading
  if (isAddingRows || (isLoading && dataCache.size === 0)) {
    return (
      <div className="h-full flex flex-col bg-white relative">
        {/* Header */}
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex flex-shrink-0">
          <div className="w-12 border-r border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">#</span>
          </div>
          {visibleColumns.map((column) => (
            <div
              key={column.id}
              className="border-r border-gray-200 flex items-center px-4 py-3"
              style={{ width: getColumnWidth(column.name) }}
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          ))}
          <div className="w-12 border-r border-gray-200 flex items-center justify-center">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Skeleton rows */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-12 flex border-b border-gray-100">
              <div className="w-12 border-r border-gray-200 flex items-center justify-center">
                <div className="h-3 w-6 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              </div>
              {visibleColumns.map((column, colIndex) => (
                <div
                  key={column.id}
                  className="border-r border-gray-200 flex items-center px-4 py-3"
                  style={{ width: getColumnWidth(column.name) }}
                >
                  <div
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    style={{
                      width: `${Math.random() * 60 + 40}%`,
                      animationDelay: `${(i * visibleColumns.length + colIndex) * 0.05}s`,
                    }}
                  />
                </div>
              ))}
              <div className="w-12 border-r border-gray-200" />
            </div>
          ))}
        </div>

        {/* Loading overlay with progress */}
        {isAddingRows && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md mx-4">
              <div className="relative mb-6">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Adding 100,000 rows</h3>
              <p className="text-gray-600 mb-4">
                Processing data in batches for optimal performance. This may take 2-3 minutes.
              </p>
              <div className="bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
              <p className="text-sm text-gray-500">Please keep this tab open while processing...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Background loading progress bar */}
      {isBackgroundLoading && loadingProgress < 100 && (
        <div className="h-1 bg-gray-200 flex-shrink-0">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Scrollable table container */}
      <div ref={parentRef} className="flex-1 overflow-auto" style={{ height: "calc(100% - 48px)" }}>
        <div style={{ minWidth: Math.max(totalTableWidth, 800), height: "fit-content" }}>
          {/* Table Header - Sticky */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 flex">
            {/* Row number header */}
            <div className="w-12 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex items-center justify-center px-2 py-3">
              <span className="text-xs text-gray-500 font-medium">#</span>
            </div>

            {/* Column headers */}
            {visibleColumns.map((column) => (
              <div
                key={column.id}
                className="border-r border-gray-200 bg-gray-50 flex items-center px-4 py-3 flex-shrink-0"
                style={{ width: getColumnWidth(column.name) }}
              >
                <span className="font-medium text-gray-900 truncate">{column.name}</span>
                <svg
                  className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ))}

            {/* Add column button */}
            <div className="w-12 border-r border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
              <button
                onClick={() => setIsAddColumnModalOpen(true)}
                className="p-2 hover:bg-gray-200 rounded transition-colors group"
                title="Add Column"
              >
                <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* Virtualized Table Body */}
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = dataCache.get(virtualRow.index)
              const isDataLoaded = !!row
              const isInCurrentRange = virtualRow.index >= loadStartIndex && virtualRow.index <= loadEndIndex
              const shouldShowSkeleton = !isDataLoaded && (!isInCurrentRange || currentRangeLoading)

              return (
                <div
                  key={virtualRow.index}
                  className="absolute top-0 left-0 w-full flex border-b border-gray-100 hover:bg-blue-50 group"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {/* Row number - always show */}
                  <div className="w-12 flex-shrink-0 bg-white border-r border-gray-200 flex items-center justify-center px-2 py-3">
                    <span className="text-xs text-gray-400 font-mono">{virtualRow.index + 1}</span>
                  </div>

                  {/* Data cells or skeleton cells */}
                  {visibleColumns.map((column, colIndex) => {
                    if (shouldShowSkeleton) {
                      // Show skeleton for unloaded data
                      return (
                        <div
                          key={column.id}
                          className="border-r border-gray-200 flex-shrink-0 bg-white"
                          style={{ width: getColumnWidth(column.name) }}
                        >
                          <SkeletonCell width={getColumnWidth(column.name)} />
                        </div>
                      )
                    }

                    // Show actual data
                    const cell = row?.cells.find((c) => c.columnId === column.id)
                    return (
                      <div
                        key={column.id}
                        className="border-r border-gray-200 flex items-center px-4 py-3 flex-shrink-0 bg-white"
                        style={{ width: getColumnWidth(column.name) }}
                      >
                        {row ? (
                          <EditableCell
                            cell={cell}
                            column={column}
                            rowId={row.id}
                            tableId={tableId}
                            rowIndex={virtualRow.index}
                            colIndex={colIndex}
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">Loading...</span>
                        )}
                      </div>
                    )
                  })}

                  {/* Empty cell for add column */}
                  <div className="w-12 border-r border-gray-200 flex-shrink-0 bg-white" />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer with summary - Fixed at bottom */}
      <div className="h-12 bg-gray-50 border-t border-gray-200 flex items-center px-4 text-sm text-gray-600 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
            <Plus className="h-4 w-4" />
            Add Record
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <span className="font-medium">
            {actualTotalRows.toLocaleString()} record{actualTotalRows !== 1 ? "s" : ""}
            <span className="text-gray-400 ml-1">
              ({dataCache.size.toLocaleString()} cached)
              {currentRangeLoading && " • Loading visible..."}
              {isBackgroundLoading && backgroundLoadQueue.length > 0 && (
                <span className="text-blue-600"> • Loading all ({Math.round(loadingProgress)}%)</span>
              )}
            </span>
          </span>
          {totalBalance > 0 && <span className="font-medium">Total Balance: ${totalBalance.toLocaleString()}</span>}
          <span className="text-xs text-gray-400">
            Viewing rows {firstVisibleIndex + 1}-{lastVisibleIndex + 1}
          </span>
        </div>
      </div>

      {/* Add Column Modal */}
      <AddColumnModal isOpen={isAddColumnModalOpen} onClose={() => setIsAddColumnModalOpen(false)} tableId={tableId} />
    </div>
  )
}
