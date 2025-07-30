export default function TableCardSkeleton() {
  return (
    <div className="rounded border border-gray-300 bg-white p-4 shadow-sm animate-pulse">
      {/* Title and icon skeleton */}
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 bg-gray-200 rounded" />
        <div className="h-5 w-28 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
