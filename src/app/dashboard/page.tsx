"use client"

import { useState } from "react"
import Sidebar from "../_components/dashboardCom/Sidebar"
import type { Base, Table } from "~/types"
import Navbar from "../_components/dashboardCom/Navbar"
import BaseCard from "../_components/dashboardCom/BaseCard"
import TableCard from "../_components/dashboardCom/TableCard"
import CreateBaseModal from "../_components/dashboardCom/CreateBaseModal"
import CreateTableModal from "../_components/dashboardCom/CreateTableModal"

export default function DashboardPage() {
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isCreateBaseOpen, setIsCreateBaseOpen] = useState(false)
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)

  // Mock data
  const bases: Base[] = [
    { id: "base1", name: "Marketing", description: "Marketing campaigns and leads" },
    { id: "base2", name: "Sales", description: "Sales pipeline and customers" },
    { id: "base3", name: "HR", description: "Employee records and recruitment" },
  ]

  const tables: Table[] = [
    { id: "table1", name: "Contacts" },
    { id: "table2", name: "Campaigns" },
    { id: "table3", name: "Leads" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedBase={selectedBase}
          setSelectedBase={setSelectedBase}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          setIsCreateBaseOpen={setIsCreateBaseOpen}
          setIsCreateTableOpen={setIsCreateTableOpen}
        />

        <main className="flex-1 overflow-auto p-8">
          {!selectedBase ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bases</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bases.map((base) => (
                  <BaseCard key={base.id} base={base} onClick={() => setSelectedBase(base.id)} />
                ))}
              </div>
            </div>
          ) : !selectedTable ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tables in {bases.find((b) => b.id === selectedBase)?.name}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => (
                  <TableCard key={table.id} table={table} onClick={() => setSelectedTable(table.id)} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {tables.find((t) => t.id === selectedTable)?.name} Table
              </h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Table view will be implemented here.</p>
                <p className="text-sm text-gray-500 mt-2">
                  This would show a spreadsheet-like interface for managing records.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {isCreateBaseOpen && <CreateBaseModal onClose={() => setIsCreateBaseOpen(false)} />}

      {isCreateTableOpen && <CreateTableModal onClose={() => setIsCreateTableOpen(false)} />}
    </div>
  )
}
