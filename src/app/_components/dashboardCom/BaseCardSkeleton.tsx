export default function BaseCardSkeleton() {
  return (
    <div className="relative rounded border border-gray-300 bg-white p-4 shadow-sm animate-pulse">
      {/* Delete button skeleton */}
      <div className="absolute top-2 right-2 flex items-center space-x-1 rounded px-2 py-1">
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>

      {/* Title and icon skeleton */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-5 w-5 bg-gray-200 rounded" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
