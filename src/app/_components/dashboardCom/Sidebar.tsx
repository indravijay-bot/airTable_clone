"use client";

import React from "react";
import {
  Plus,
  Database,
  TableIcon,
  User,
  Menu,
  Home,
  Settings,
  HelpCircle,
  ChevronRight,
  Folder,
  X,
  ChevronDown,
} from "lucide-react";
import type { Base, Table } from "~/app/dashboard/types";
type SidebarProps = {
  selectedBase: string | null;
  setSelectedBase: (id: string | null) => void;
  selectedTable: string | null;
  setSelectedTable: (id: string | null) => void;
  setIsCreateBaseOpen: (open: boolean) => void;
  setIsCreateTableOpen: (open: boolean) => void;
};

export default function Sidebar({
  selectedBase,
  setSelectedBase,
  selectedTable,
  setSelectedTable,
  setIsCreateBaseOpen,
  setIsCreateTableOpen,
}: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  // Mock data - replace with your real data or pass as props
  const bases: Base[] = [
    { id: "base1", name: "Marketing", description: "Marketing base" },
    { id: "base2", name: "Sales", description: "Sales base" },
  ];
  const tables: Table[] = [
    { id: "table1", name: "Contacts" },
    { id: "table2", name: "Campaigns" },
  ];

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const toggleUserMenu = () => setIsUserMenuOpen((v) => !v);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full lg:w-12 lg:translate-x-0"
        } lg:static lg:inset-0`}
        aria-label="Sidebar"
      >
        <div
          className={`flex h-full flex-col overflow-hidden ${
            !isSidebarOpen ? "lg:items-center lg:py-4" : ""
          }`}
        >
          {isSidebarOpen ? (
            <>
              {/* Sidebar Header */}
              <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4">
                <h2 className="text-md font-bold text-gray-800 select-none">
                  Menu
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSidebar}
                    className="hidden rounded p-2 hover:bg-gray-100 lg:flex"
                    title="Collapse sidebar"
                    aria-label="Collapse sidebar"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="rounded p-2 hover:bg-gray-100 lg:hidden"
                    title="Close sidebar"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav
                className="flex-1 space-y-2 overflow-y-auto px-4 py-4"
                aria-label="Primary"
              >
                <button
                  onClick={() => {
                    setSelectedBase(null);
                    setSelectedTable(null);
                  }}
                  className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  <Home className="h-4 w-4" />
                  Home
                </button>

                <section className="pt-4" aria-labelledby="bases-label">
                  <div className="mb-2 flex items-center justify-between">
                    <h2
                      id="bases-label"
                      className="text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      Bases
                    </h2>
                    <button
                      onClick={() => setIsCreateBaseOpen(true)}
                      className="flex h-6 w-6 items-center justify-center rounded p-0 hover:bg-gray-100"
                      title="Create new base"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    className="space-y-1"
                    role="list"
                    aria-label="Bases list"
                  >
                    {bases.map((base) => (
                      <div key={base.id}>
                        <button
                          onClick={() => {
                            if (selectedBase === base.id) {
                              setSelectedBase(null);
                              setSelectedTable(null);
                            } else {
                              setSelectedBase(base.id);
                              setSelectedTable(null);
                            }
                          }}
                          className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                            selectedBase === base.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                          aria-current={
                            selectedBase === base.id ? "true" : undefined
                          }
                          role="listitem"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              selectedBase === base.id ? "rotate-90" : ""
                            }`}
                            aria-hidden="true"
                          />
                          <Folder className="h-4 w-4" aria-hidden="true" />
                          <span className="truncate">{base.name}</span>
                        </button>
                        {selectedBase === base.id && (
                          <div
                            className="mt-1 ml-6 space-y-1"
                            role="list"
                            aria-label={`${base.name} tables`}
                          >
                            {tables.map((table) => (
                              <button
                                key={table.id}
                                onClick={() => setSelectedTable(table.id)}
                                className={`flex w-full items-center gap-2 rounded px-3 py-1 text-left text-xs hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                                  selectedTable === table.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                }`}
                                aria-current={
                                  selectedTable === table.id ? "true" : undefined
                                }
                                role="listitem"
                              >
                                <TableIcon
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                <span className="truncate">{table.name}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => setIsCreateTableOpen(true)}
                              className="flex w-full items-center gap-2 rounded px-3 py-1 text-left text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                              title="Add table"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add table</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </nav>

              {/* Sidebar Footer */}
              <div className="flex-shrink-0 space-y-2 border-t border-gray-200 p-4">
                <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Settings
                </button>
                <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  Help
                </button>
              </div>
            </>
          ) : (
            // Collapsed Sidebar: Icons only
            <nav
              className="flex h-full flex-col items-center space-y-4 py-4 lg:w-12"
              aria-label="Collapsed sidebar"
            >
              <button
                onClick={toggleSidebar}
                className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>

              <button
                className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                title="Home"
                aria-label="Home"
                onClick={() => {
                  setSelectedBase(null);
                  setSelectedTable(null);
                }}
              >
                <Home className="h-6 w-6" />
              </button>

              {/* {bases.map((base) => (
                <button
                  key={base.id}
                  className={`rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    selectedBase === base.id ? "bg-blue-100 text-blue-700" : ""
                  }`}
                  title={base.name}
                  aria-label={base.name}
                  onClick={() => {
                    if (selectedBase === base.id) {
                      setSelectedBase(null);
                      setSelectedTable(null);
                    } else {
                      setSelectedBase(base.id);
                      setSelectedTable(null);
                    }
                  }}
                >
                  <Folder className="h-6 w-6" />
                </button>
              ))} */}

              <button
                onClick={() => setIsCreateBaseOpen(true)}
                className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                title="Create new base"
                aria-label="Create new base"
              >
                <Plus className="h-6 w-6" />
              </button>

              <div className="mt-auto space-y-2">
                <button
                  className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  title="Settings"
                  aria-label="Settings"
                >
                  <Settings className="h-6 w-6" />
                </button>

                <button
                  className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  title="Help"
                  aria-label="Help"
                >
                  <HelpCircle className="h-6 w-6" />
                </button>
              </div>
            </nav>
          )}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-25 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
