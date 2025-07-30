"use client"

export default function TableSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Table Header Skeleton */}
      <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="flex">
          {/* Row number column */}
          <div className="w-10 border-r border-gray-200 px-3 py-2 bg-gray-50">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Column headers */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-40 border-r border-gray-200 px-3 py-2 bg-gray-50">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}

          {/* Add column button */}
          <div className="w-12 border-r border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-center">
            <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="flex-1 overflow-hidden">
        {[...Array(15)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-gray-100 hover:bg-blue-50">
            {/* Row number */}
            <div className="w-10 border-r border-gray-200 px-3 py-2 flex items-center justify-center">
              <div className="h-3 w-4 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Cells */}
            {[1, 2, 3, 4, 5].map((cellIndex) => (
              <div key={cellIndex} className="w-40 border-r border-gray-200 px-3 py-2 flex items-center">
                <div
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{
                    width: `${Math.random() * 60 + 40}%`,
                    animationDelay: `${(rowIndex * 5 + cellIndex) * 0.1}s`,
                  }}
                />
              </div>
            ))}

            {/* Empty cell for add column */}
            <div className="w-12 border-r border-gray-200 px-3 py-2" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="h-10 bg-gray-50 border-t border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
