"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "../_components/dashboardCom/Sidebar"
import Navbar from "../_components/dashboardCom/Navbar"
import BaseCard from "../_components/dashboardCom/BaseCard"
import TableCard from "../_components/dashboardCom/TableCard"
import CreateBaseModal from "../_components/dashboardCom/CreateBaseModal"
import CreateTableModal from "../_components/dashboardCom/CreateTableModal"
import { api } from "~/trpc/react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isCreateBaseOpen, setIsCreateBaseOpen] = useState(false)
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // TRPC context for query invalidation
  const utils = api.useContext()

  // Fetch bases
  const { data: bases = [], isLoading: basesLoading, error: basesError } = api.base.getAll.useQuery()

  // Mutation for deleting base
  const deleteBaseMutation = api.base.delete.useMutation({
    onSuccess: () => {
      utils.base.getAll.invalidate()
      if (selectedBase) setSelectedBase(null)
      setSelectedTable(null)
    },
    onError: (e) => {
      alert(e)
    },
  })

  // Memoized query input for tables
  const baseIdQueryInput = useMemo(() => {
    if (!selectedBase) return undefined
    return { baseId: selectedBase }
  }, [selectedBase])

  // Fetch tables for selected base
  const { data: tables = [], isLoading: tablesLoading } = api.table.getByBaseId.useQuery(baseIdQueryInput!, {
    enabled: !!selectedBase,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Navbar - Always on top */}
      <Navbar onMenuClick={toggleSidebar} />

      {/* Sidebar - Below navbar */}
      <Sidebar
        isOpen={isSidebarOpen}
        selectedBase={selectedBase}
        setSelectedBase={setSelectedBase}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        setIsCreateBaseOpen={setIsCreateBaseOpen}
        setIsCreateTableOpen={setIsCreateTableOpen}
        bases={bases}
        tables={tables}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col pt-12">
        {" "}
        {/* pt-12 for navbar height */}
        <main className="flex-1 overflow-auto p-6 ml-10">
          {" "}
          {/* ml-10 for collapsed sidebar */}
          {/* Error Handling */}
          {basesError && <div className="text-red-600">Error loading bases: {basesError.message}</div>}
          {/* Show Bases */}
          {!selectedBase && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Your Bases</h1>
                <button
                  onClick={() => setIsCreateBaseOpen(true)}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Create Base
                </button>
              </div>
              {basesLoading ? (
                <div className="text-gray-600">Loading bases...</div>
              ) : bases.length === 0 ? (
                <div className="text-gray-500">No bases found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bases.map((base) => (
                    <BaseCard
                      key={base.id}
                      base={{
                        id: base.id,
                        name: base.name,
                        description: base.description || "No description",
                      }}
                      onClick={() => setSelectedBase(base.id)}
                      onDelete={(id) => {
                        deleteBaseMutation.mutate({ id })
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Show Tables */}
          {selectedBase && !selectedTable && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <button
                    onClick={() => {
                      setSelectedBase(null)
                      setSelectedTable(null)
                    }}
                    className="mb-2 text-blue-600 hover:text-blue-800"
                  >
                    ← Back to Bases
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {bases.find((b) => b.id === selectedBase)?.name} Tables
                  </h1>
                </div>
                <button
                  onClick={() => setIsCreateTableOpen(true)}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Create Table
                </button>
              </div>
              {tablesLoading ? (
                <div className="text-gray-600">Loading tables...</div>
              ) : tables.length === 0 ? (
                <div className="text-gray-500">No tables found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={{
                        id: table.id,
                        name: table.name,
                      }}
                      onClick={() => setSelectedTable(table.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Table Detail Placeholder */}
          {selectedBase && selectedTable && (
            <div>
              <button onClick={() => setSelectedTable(null)} className="mb-4 text-blue-600 hover:text-blue-800">
                ← Back to Tables
              </button>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {tables.find((t) => t.id === selectedTable)?.name} Table
              </h2>
              <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">Table view will be implemented here.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {isCreateBaseOpen && <CreateBaseModal onClose={() => setIsCreateBaseOpen(false)} />}
      {isCreateTableOpen && selectedBase && (
        <CreateTableModal onClose={() => setIsCreateTableOpen(false)} baseId={selectedBase} />
      )}
    </div>
  )
}
