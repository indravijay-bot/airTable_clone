"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Sidebar from "../_components/dashboardCom/Sidebar"
import Navbar from "../_components/dashboardCom/Navbar"
import BaseCard from "../_components/dashboardCom/BaseCard"
import BaseCardSkeleton from "../_components/dashboardCom/BaseCardSkeleton"
import TableCard from "../_components/dashboardCom/TableCard"
import CreateBaseModal from "../_components/dashboardCom/CreateBaseModal"
import CreateTableModal from "../_components/dashboardCom/CreateTableModal"
import { api } from "~/trpc/react"
import TableCardSkeleton from "../_components/dashboardCom/TableCardSkeleton.tsx"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isCreateBaseOpen, setIsCreateBaseOpen] = useState(false)
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [deletingBaseId, setDeletingBaseId] = useState<string | null>(null)
  const [isCreatingBase, setIsCreatingBase] = useState(false)
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null)

  // TRPC context for query invalidation
  const utils = api.useContext()

  // Fetch bases
  const { data: bases = [], isLoading: basesLoading, error: basesError } = api.base.getAll.useQuery()

  // Mutation for deleting base
  const deleteBaseMutation = api.base.delete.useMutation({
    onMutate: (variables) => {
      setDeletingBaseId(variables.id)
    },
    onSuccess: () => {
      utils.base.getAll.invalidate()
      if (selectedBase === deletingBaseId) {
        setSelectedBase(null)
      }
      setSelectedTable(null)
      //  setDeletingBaseId(null)
    },
    onError: (error) => {
      console.error("Delete error:", error)
      alert(`Failed to delete base: ${error.message}`)
      setDeletingBaseId(null)
    },
  })

  // Mutation for deleting table
  const deleteTableMutation = api.table.delete.useMutation({
    onMutate: (variables) => {
      setDeletingTableId(variables.id)
    },
    onSuccess: () => {
      utils.table.getByBaseId.invalidate({ baseId: selectedBase! })
      if (selectedTable === deletingTableId) {
        setSelectedTable(null)
      }
    },
    onError: (error) => {
      console.error("Delete table error:", error)
      alert(`Failed to delete table: ${error.message}`)
      setDeletingTableId(null)
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

  const handleDeleteBase = (baseId: string) => {
    //if (confirm("Are you sure you want to delete this base? This action cannot be undone.")) {
    deleteBaseMutation.mutate({ id: baseId })
    //   }
  }

  const handleDeleteTable = (tableId: string) => {
    deleteTableMutation.mutate({ id: tableId })
  }

  // Render skeleton cards for bases
  const renderBaseSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => <BaseCardSkeleton key={`base-skeleton-${index}`} />)
  }

  // Render skeleton cards for tables
  const renderTableSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => <TableCardSkeleton key={`table-skeleton-${index}`} />)
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
      <div
        className={`flex-1 flex flex-col pt-12 transition-all duration-150 ease-out ${
          isSidebarOpen ? "ml-60" : "ml-10"
        }`}
      >
        {" "}
        {/* pt-12 for navbar height */}
        <main className="flex-1 overflow-auto p-6">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{renderBaseSkeletons()}</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Show skeleton for creating base */}
                  {isCreatingBase && <BaseCardSkeleton />}

                  {bases.length === 0 && !isCreatingBase ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      <p className="text-lg mb-2">No bases found</p>
                      <p className="text-sm">Create your first base to get started</p>
                    </div>
                  ) : (
                    bases.map((base) => (
                      <BaseCard
                        key={base.id}
                        base={{
                          id: base.id,
                          name: base.name,
                          description: base.description || "No description",
                        }}
                        onClick={() => setSelectedBase(base.id)}
                        onDelete={handleDeleteBase}
                        isDeleting={deletingBaseId === base.id}
                      />
                    ))
                  )}
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{renderTableSkeletons()}</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Show skeleton for creating table */}
                  {isCreatingTable && <TableCardSkeleton />}

                  {tables.length === 0 && !isCreatingTable ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      <p className="text-lg mb-2">No tables found</p>
                      <p className="text-sm">Create your first table to get started</p>
                    </div>
                  ) : (
                    tables.map((table) => (
                      <TableCard
                        key={table.id}
                        table={{
                          id: table.id,
                          name: table.name,
                        }}
                        onClick={() => setSelectedTable(table.id)}
                        onDelete={handleDeleteTable}
                        isDeleting={deletingTableId === table.id}
                      />
                    ))
                  )}
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

      {isCreateBaseOpen && (
        <CreateBaseModal onClose={() => setIsCreateBaseOpen(false)} onCreating={setIsCreatingBase} />
      )}
      {isCreateTableOpen && selectedBase && (
        <CreateTableModal
          onClose={() => setIsCreateTableOpen(false)}
          baseId={selectedBase}
          onCreating={setIsCreatingTable}
        />
      )}
    </div>
  )
}
