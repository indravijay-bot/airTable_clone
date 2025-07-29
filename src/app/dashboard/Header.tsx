import {
  Database,
  Menu,
  Plus,
  User,
  CheckCircle,
} from "lucide-react"

export function Header({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean; toggleSidebar: () => void }) {
  const isDatabaseAvailable = true
  const isLoading = false

  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
              title="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <div className="lg:hidden flex items-center space-x-2">
              <Database className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-semibold">Airtable Clone</h1>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold">Your Bases</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Demo User</span>
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin text-blue-500" />
              ) : isDatabaseAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <span className="text-red-500">!</span>
              )}
            </div>
            <button
              type="button"
              disabled={!isDatabaseAvailable}
              className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Base
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
