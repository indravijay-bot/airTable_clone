"use client";

import React, { useState } from "react";
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

export default function Dashboard() {
  // UI states
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [newBaseName, setNewBaseName] = useState("");
  const [newBaseDescription, setNewBaseDescription] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [isCreateBaseOpen, setIsCreateBaseOpen] = useState(false);
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Static mock data
  const bases = [
    { id: "base1", name: "Marketing", description: "Marketing base" },
    { id: "base2", name: "Sales", description: "Sales base" },
  ];
  const tables = [
    { id: "table1", name: "Contacts" },
    { id: "table2", name: "Campaigns" },
  ];

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const toggleUserMenu = () => setIsUserMenuOpen((v) => !v);

  if (selectedTable) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => setSelectedTable(null)}
          className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1 hover:bg-gray-100"
        >
          &larr; Back to Tables
        </button>
        <h2 className="mt-4 text-2xl font-bold">Table: {selectedTable}</h2>
        <p className="mt-2 text-gray-700">Table details would appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top Navbar */}
      <nav className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
        <button
          onClick={toggleSidebar}
          className="rounded p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 select-none">
          Airtable Clone
        </h1>

        <div className="relative inline-block text-left">
          <button
            onClick={toggleUserMenu}
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <User className="mr-2 h-5 w-5" />
            Demo User
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
          {isUserMenuOpen && (
            <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black">
              <div className="py-1">
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 transform border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
            isSidebarOpen
              ? "w-64 translate-x-0"
              : "w-0 -translate-x-full lg:w-12 lg:translate-x-0"
          } lg:static lg:inset-0`}
          aria-label="Sidebar"
        >
          <div
            className={`flex h-full flex-col overflow-hidden ${!isSidebarOpen ? "lg:items-center lg:py-4" : ""}`}
          >
            {isSidebarOpen ? (
              <>
                {/* Sidebar Header (icon only) */}
                <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4">
                  <div title="App Logo">
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
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
                                    selectedTable === table.id
                                      ? "true"
                                      : undefined
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
              <div className="hidden flex-col items-center space-y-4 pt-4 lg:flex">
                <button
                  onClick={toggleSidebar}
                  className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => {
                    setSelectedBase(null);
                    setSelectedTable(null);
                  }}
                  className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  title="Home"
                >
                  <Home className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setIsCreateBaseOpen(true)}
                  className="rounded p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  title="New Base"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Sidebar Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto rounded-lg bg-white p-8 shadow lg:ml-0">
          {!selectedBase ? (
            <>
              <h2 className="mb-6 text-2xl font-bold lg:hidden">Your Bases</h2>
              {bases.length === 0 ? (
                <div className="py-12 text-center text-gray-600">
                  <Database
                    className="mx-auto mb-4 h-12 w-12"
                    aria-hidden="true"
                  />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No bases yet
                  </h3>
                  <p className="mb-4">Create your first base to get started</p>
                  <button
                    onClick={() => setIsCreateBaseOpen(true)}
                    className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Base
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bases.map((base) => (
                    <div
                      key={base.id}
                      onClick={() => setSelectedBase(base.id)}
                      className="cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedBase(base.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2 font-semibold text-gray-900">
                        <Database
                          className="h-5 w-5 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{base.name}</span>
                      </div>
                      <p className="mt-1 text-gray-600">{base.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="mb-6 text-2xl font-bold lg:hidden">
                {bases.find((b) => b.id === selectedBase)?.name} Tables
              </h2>
              {tables.length === 0 ? (
                <div className="py-12 text-center text-gray-600">
                  <TableIcon
                    className="mx-auto mb-4 h-12 w-12"
                    aria-hidden="true"
                  />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No tables yet
                  </h3>
                  <p className="mb-4">
                    Create your first table to start organizing data
                  </p>
                  <button
                    onClick={() => setIsCreateTableOpen(true)}
                    className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Table
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className="cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedTable(table.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2 font-semibold text-gray-900">
                        <TableIcon
                          className="h-5 w-5 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{table.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Create Base Modal */}
        {isCreateBaseOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-base-title"
          >
            <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
              <h3 id="create-base-title" className="mb-4 text-lg font-semibold">
                Create New Base
              </h3>
              <label
                htmlFor="baseName"
                className="mb-1 block font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="baseName"
                value={newBaseName}
                onChange={(e) => setNewBaseName(e.target.value)}
                placeholder="Enter base name"
                className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <label
                htmlFor="baseDescription"
                className="mb-1 block font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="baseDescription"
                value={newBaseDescription}
                onChange={(e) => setNewBaseDescription(e.target.value)}
                placeholder="Enter base description"
                className="mb-4 w-full resize-none rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsCreateBaseOpen(false);
                    setNewBaseName("");
                    setNewBaseDescription("");
                  }}
                  className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // No backend logic, just close modal
                    setIsCreateBaseOpen(false);
                    setNewBaseName("");
                    setNewBaseDescription("");
                  }}
                  disabled={!newBaseName.trim()}
                  className={`rounded px-4 py-2 font-semibold text-white ${
                    newBaseName.trim()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "cursor-not-allowed bg-blue-300"
                  }`}
                >
                  Create Base
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Table Modal */}
        {isCreateTableOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-table-title"
          >
            <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
              <h3
                id="create-table-title"
                className="mb-4 text-lg font-semibold"
              >
                Create New Table
              </h3>
              <label
                htmlFor="tableName"
                className="mb-1 block font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="tableName"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Enter table name"
                className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsCreateTableOpen(false);
                    setNewTableName("");
                  }}
                  className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // No backend logic, just close modal
                    setIsCreateTableOpen(false);
                    setNewTableName("");
                  }}
                  disabled={!newTableName.trim()}
                  className={`rounded px-4 py-2 font-semibold text-white ${
                    newTableName.trim()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "cursor-not-allowed bg-blue-300"
                  }`}
                >
                  Create Table
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
