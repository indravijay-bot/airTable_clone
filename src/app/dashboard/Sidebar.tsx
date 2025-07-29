import { useState } from "react"
import {
  Database,
  Folder,
  ChevronRight,
  Plus,
  Home,
  Menu,
  Settings,
  HelpCircle,
  TableIcon,
  X,
} from "lucide-react"

export function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const bases = [
    { id: "base1", name: "Sales Database" },
    { id: "base2", name: "HR Records" },
  ]

  const tables = [
    { id: "table1", name: "Customers" },
    { id: "table2", name: "Orders" },
  ]

  const isDatabaseAvailable = true

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${
        isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-12 lg:translate-x-0"
      } lg:static lg:inset-0`}
    >
      <div className={`flex flex-col h-full overflow-hidden ${!isOpen ? "lg:items-center lg:py-4" : ""}`}>
        {isOpen ? (
          <>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Airtable Clone</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:flex p-2 hover:bg-gray-100 rounded"
                  title="Collapse sidebar"
                  type="button"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded"
                  type="button"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              <button
                type="button"
                className="w-full flex items-center text-gray-700 hover:bg-gray-100 rounded px-2 py-1"
              >
                <Home className="h-4 w-4 mr-3" />
                Home
              </button>

              {/* Bases Section */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bases</span>
                  <button
                    type="button"
                    disabled={!isDatabaseAvailable}
                    className={`h-6 w-6 p-0 flex items-center justify-center rounded ${
                      isDatabaseAvailable ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
                    }`}
                    title="Create new base"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {bases.map((base) => (
                    <div key={base.id}>
                      <button
                        type="button"
                        className="w-full flex items-center text-gray-700 hover:bg-gray-100 rounded px-2 py-1"
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        <Folder className="h-4 w-4 mr-2" />
                        <span className="truncate">{base.name}</span>
                      </button>
                      {base.id === "base1" && (
                        <div className="ml-6 mt-1 space-y-1">
                          {tables.map((table) => (
                            <button
                              key={table.id}
                              type="button"
                              className="w-full flex items-center text-gray-600 hover:bg-gray-100 rounded px-2 py-0.5 text-xs"
                            >
                              <TableIcon className="h-3 w-3 mr-2" />
                              {table.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={!isDatabaseAvailable}
                            className="w-full flex items-center justify-start text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded px-2 py-0.5 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Add table
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-gray-200 p-4 space-y-2 flex-shrink-0">
              <button
                type="button"
                className="w-full flex items-center text-gray-700 hover:bg-gray-100 rounded px-2 py-1"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
              <button
                type="button"
                className="w-full flex items-center text-gray-700 hover:bg-gray-100 rounded px-2 py-1"
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help
              </button>
            </div>
          </>
        ) : (
          /* Collapsed Sidebar for Desktop */
          <div className="hidden lg:flex flex-col items-center space-y-4 pt-4">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded"
              title="Expand sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded" title="Home">
              <Home className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={!isDatabaseAvailable}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="New Base"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
