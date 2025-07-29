"use client";

import { useState } from "react";

import Sidebar from "../_components/dashboardCom/Sidebar";
import type { Base, Table } from "~/types";
import Navbar from "../_components/dashboardCom/Navbar";
import BaseCard from "../_components/dashboardCom/BaseCard";
import TableCard from "../_components/dashboardCom/TableCard";
import CreateBaseModal from "../_components/dashboardCom/CreateBaseModal";
import CreateTableModal from "../_components/dashboardCom/CreateTableModal";

export default function DashboardPage() {
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isCreateBaseOpen, setIsCreateBaseOpen] = useState(false);
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);

  // Replace these with your real data or fetch dynamically
  const bases: Base[] = [
    { id: "base1", name: "Marketing", description: "Marketing base" },
    { id: "base2", name: "Sales", description: "Sales base" },
  ];

  const tables: Table[] = [
    { id: "table1", name: "Contacts" },
    { id: "table2", name: "Campaigns" },
  ];

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bases.map((base) => (
                <BaseCard
                  key={base.id}
                  base={base}
                  onClick={() => setSelectedBase(base.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onClick={() => setSelectedTable(table.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {isCreateBaseOpen && (
        <CreateBaseModal onClose={() => setIsCreateBaseOpen(false)} />
      )}

      {isCreateTableOpen && (
        <CreateTableModal onClose={() => setIsCreateTableOpen(false)} />
      )}
    </div>
  );
}
