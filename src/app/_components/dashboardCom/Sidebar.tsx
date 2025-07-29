"use client"

import React from "react"
import { Plus, TableIcon, Home, Settings, HelpCircle, ChevronRight, Database } from "lucide-react"

type Base = {
  id: string
  name: string
  description?: string
}

type Table = {
  id: string
  name: string
}

type SidebarProps = {
  isOpen: boolean
  selectedBase: string | null
  setSelectedBase: (id: string | null) => void
  selectedTable: string | null
  setSelectedTable: (id: string | null) => void
  setIsCreateBaseOpen: (open: boolean) => void
  setIsCreateTableOpen: (open: boolean) => void
  bases: Base[]
  tables: Table[]
}

export default function Sidebar({
  isOpen,
  selectedBase,
  setSelectedBase,
  selectedTable,
  setSelectedTable,
  setIsCreateBaseOpen,
  setIsCreateTableOpen,
  bases,
  tables,
}: SidebarProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [expandedBases, setExpandedBases] = React.useState<Set<string>>(new Set())

  const shouldShowExpanded = isOpen || isHovered

  const toggleBase = (baseId: string) => {
    const newExpanded = new Set(expandedBases)
    if (newExpanded.has(baseId)) {
      newExpanded.delete(baseId)
    } else {
      newExpanded.add(baseId)
    }
    setExpandedBases(newExpanded)
  }

  // Auto-expand selected base
  React.useEffect(() => {
    if (selectedBase) {
      setExpandedBases((prev) => new Set([...prev, selectedBase]))
    }
  }, [selectedBase])

  return (
    <>
      <aside
        className={`fixed top-12 left-0 bottom-0 bg-gray-50 border-r border-gray-200 transition-all duration-150 ease-out z-40 ${
          shouldShowExpanded ? "w-60" : "w-10"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {shouldShowExpanded ? (
            <>
              {/* Expanded Sidebar */}
              <div className="flex-1 overflow-y-auto py-2">
                <div className="px-3 py-2">
                  <button
                    onClick={() => {
                      setSelectedBase(null)
                      setSelectedTable(null)
                    }}
                    className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm rounded hover:bg-gray-200 transition-colors ${
                      !selectedBase ? "bg-gray-200 text-gray-900 font-medium" : "text-gray-700"
                    }`}
                  >
                    <Home className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Home</span>
                  </button>
                </div>

                <div className="px-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bases</span>
                    <button
                      onClick={() => setIsCreateBaseOpen(true)}
                      className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                      title="Create base"
                    >
                      <Plus className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {bases.map((base) => (
                      <div key={base.id}>
                        <button
                          onClick={() => {
                            if (selectedBase === base.id) {
                              setSelectedBase(null)
                              setSelectedTable(null)
                            } else {
                              setSelectedBase(base.id)
                              setSelectedTable(null)
                              toggleBase(base.id)
                            }
                          }}
                          className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm rounded hover:bg-gray-200 transition-colors group ${
                            selectedBase === base.id ? "bg-gray-200 text-gray-900" : "text-gray-700"
                          }`}
                        >
                          <ChevronRight
                            className={`h-3 w-3 flex-shrink-0 transition-transform text-gray-400 ${
                              expandedBases.has(base.id) ? "rotate-90" : ""
                            }`}
                          />
                          <Database className="h-4 w-4 flex-shrink-0 text-orange-500" />
                          <span className="truncate font-medium">{base.name}</span>
                        </button>

                        {expandedBases.has(base.id) && selectedBase === base.id && (
                          <div className="ml-5 mt-0.5 space-y-0.5">
                            {tables.map((table) => (
                              <button
                                key={table.id}
                                onClick={() => setSelectedTable(table.id)}
                                className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs rounded hover:bg-gray-200 transition-colors ${
                                  selectedTable === table.id ? "bg-gray-200 text-gray-900 font-medium" : "text-gray-600"
                                }`}
                              >
                                <TableIcon className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                <span className="truncate">{table.name}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => setIsCreateTableOpen(true)}
                              className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs text-gray-500 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            >
                              <Plus className="h-3 w-3 flex-shrink-0" />
                              <span>Add table</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-3 space-y-0.5">
                <button className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-gray-700 rounded hover:bg-gray-200 transition-colors">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span>Settings</span>
                </button>
                <button className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-gray-700 rounded hover:bg-gray-200 transition-colors">
                  <HelpCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Help</span>
                </button>
              </div>
            </>
          ) : (
            /* Collapsed Sidebar - Icons only */
            <div className="flex h-full flex-col items-center py-2">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedBase(null)
                    setSelectedTable(null)
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 transition-colors ${
                    !selectedBase ? "bg-gray-200" : ""
                  }`}
                  title="Home"
                >
                  <Home className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="w-6 border-t border-gray-300 my-2" />

              <div className="space-y-1">
                {bases.slice(0, 5).map((base) => (
                  <button
                    key={base.id}
                    onClick={() => {
                      if (selectedBase === base.id) {
                        setSelectedBase(null)
                        setSelectedTable(null)
                      } else {
                        setSelectedBase(base.id)
                        setSelectedTable(null)
                      }
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 transition-colors ${
                      selectedBase === base.id ? "bg-gray-200" : ""
                    }`}
                    title={base.name}
                  >
                    <Database className="h-4 w-4 text-orange-500" />
                  </button>
                ))}
                <button
                  onClick={() => setIsCreateBaseOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 transition-colors"
                  title="Create base"
                >
                  <Plus className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="mt-auto space-y-1">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 transition-colors"
                  title="Help"
                >
                  <HelpCircle className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
