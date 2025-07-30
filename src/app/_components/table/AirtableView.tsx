// ✅ Already present
"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import EditableCell from "./EditableCell";
import AddColumnModal from "./AddColumnModal";
import { Plus, Loader2 } from "lucide-react";
import type { Column, Row } from "~/types/table";

// ✅ IMPROVED SkeletonCell for faster perception
const SkeletonCell = ({ width }: { width: number }) => (
  <div className="flex items-center px-4 py-3" style={{ width }}>
    <div
      className="h-4 bg-gray-200 rounded animate-pulse"
      style={{ width: `${Math.random() * 60 + 40}%`, animationDuration: "0.8s" }}
    />
  </div>
);

interface AirtableViewProps {
  columns: Column[];
  rows: Row[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  hiddenColumns: string[];
  tableId: string;
  isAddingRows?: boolean;
  totalRowCount?: number;
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
  const parentRef = useRef<HTMLDivElement>(null);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.includes(col.id)),
    [columns, hiddenColumns]
  );

  const estimatedTotalRows = useMemo(() => {
    if (isAddingRows) return Math.max(rows.length + 100_000, 100_000);
    if (totalRowCount) return totalRowCount;
    if (hasNextPage) return rows.length * 2;
    return rows.length;
  }, [rows.length, hasNextPage, isAddingRows, totalRowCount]);

  // ✅ OVERSCAN increased from 50 to 80
  const rowVirtualizer = useVirtualizer({
    count: estimatedTotalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 80,
  });

  // ✅ PREFETCHING early + faster
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    const nearEnd = lastItem.index >= rows.length - 30;
    if (nearEnd && hasNextPage && !isFetchingNextPage && !isAddingRows) {
      onLoadMore();
    }
  }, [rowVirtualizer.getVirtualItems(), rows.length, hasNextPage, isFetchingNextPage, isAddingRows, onLoadMore]);

  const totalBalance = rows.reduce((sum, row) => {
    const balanceCell = row.cells.find((cell) => {
      const column = columns.find((col) => col.id === cell.columnId);
      return (
        column?.name === "Account Balance" ||
        (column?.type === "NUMBER" && column?.name.toLowerCase().includes("balance"))
      );
    });
    const value = balanceCell?.value ? Number.parseFloat(balanceCell.value) : 0;
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const getColumnWidth = (columnName: string): number => {
    switch (columnName.toLowerCase()) {
      case "person name":
        return 200;
      case "account balance":
        return 150;
      case "bank name":
        return 180;
      case "account type":
        return 140;
      default:
        return 160;
    }
  };

  const totalTableWidth = visibleColumns.reduce((sum, col) => sum + getColumnWidth(col.name), 0) + 60;

  if (isAddingRows || (isLoading && rows.length === 0)) {
    return (
      <div className="h-full flex flex-col bg-white relative">
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

        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-12 flex border-b border-gray-100">
              <div className="w-12 border-r border-gray-200 flex items-center justify-center">
                <div className="h-3 w-6 bg-gray-200 rounded animate-pulse" />
              </div>
              {visibleColumns.map((column, colIndex) => (
                <div
                  key={column.id}
                  className="border-r border-gray-200 flex items-center px-4 py-3"
                  style={{ width: getColumnWidth(column.name) }}
                >
                  <div
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    style={{ width: `${Math.random() * 60 + 40}%` }}
                  />
                </div>
              ))}
              <div className="w-12 border-r border-gray-200" />
            </div>
          ))}
        </div>

        {isAddingRows && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md mx-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Adding 100,000 rows</h3>
              <p className="text-gray-600 mb-4">This may take 2–3 minutes. Please keep this tab open.</p>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div ref={parentRef} className="flex-1 overflow-auto" style={{ height: "calc(100% - 48px)" }}>
        <div style={{ minWidth: Math.max(totalTableWidth, 800) }}>
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 flex">
            <div className="w-12 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex items-center justify-center px-2 py-3">
              <span className="text-xs text-gray-500 font-medium">#</span>
            </div>
            {visibleColumns.map((column) => (
              <div
                key={column.id}
                className="border-r border-gray-200 bg-gray-50 flex items-center px-4 py-3 flex-shrink-0"
                style={{ width: getColumnWidth(column.name) }}
              >
                <span className="font-medium text-gray-900 truncate">{column.name}</span>
              </div>
            ))}
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

          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              const isDataLoaded = !!row;

              return (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full flex border-b border-gray-100 hover:bg-blue-50 group"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="w-12 flex-shrink-0 bg-white border-r border-gray-200 flex items-center justify-center px-2 py-3">
                    <span className="text-xs text-gray-400 font-mono">{virtualRow.index + 1}</span>
                  </div>

                  {visibleColumns.map((column, colIndex) => {
                    if (!isDataLoaded) {
                      return (
                        <div
                          key={column.id}
                          className="border-r border-gray-200 flex-shrink-0 bg-white"
                          style={{ width: getColumnWidth(column.name) }}
                        >
                          <SkeletonCell width={getColumnWidth(column.name)} />
                        </div>
                      );
                    }

                    const cell = row.cells.find((c) => c.columnId === column.id);
                    return (
                      <div
                        key={column.id}
                        className="border-r border-gray-200 flex items-center px-4 py-3 flex-shrink-0 bg-white"
                        style={{ width: getColumnWidth(column.name) }}
                      >
                        <EditableCell
                          cell={cell}
                          column={column}
                          rowId={row.id}
                          tableId={tableId}
                          rowIndex={virtualRow.index}
                          colIndex={colIndex}
                        />
                      </div>
                    );
                  })}

                  <div className="w-12 border-r border-gray-200 flex-shrink-0 bg-white" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
            {estimatedTotalRows.toLocaleString()} record{estimatedTotalRows !== 1 ? "s" : ""}
            {rows.length < estimatedTotalRows && (
              <span className="text-gray-400 ml-1">({rows.length.toLocaleString()} loaded)</span>
            )}
          </span>
          {totalBalance > 0 && <span className="font-medium">Total Balance: ${totalBalance.toLocaleString()}</span>}
        </div>
      </div>

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        tableId={tableId}
      />
    </div>
  );
}
