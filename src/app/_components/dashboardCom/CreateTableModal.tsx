"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { api } from "~/trpc/react"
import { toast } from "sonner"

type Props = {
  onClose: () => void
  baseId: string // baseId is needed to create a table under a base
  onCreating?: (isCreating: boolean) => void
}

export default function CreateTableModal({ onClose, baseId, onCreating }: Props) {
  const [newTableName, setNewTableName] = useState("")

  const utils = api.useContext() // useContext is recommended for utils in latest tRPC
  const { mutate, isLoading } = api.table.create.useMutation({
    onMutate: () => {
      onCreating?.(true)
    },
    onSuccess: async () => {
      // Invalidate the tables list for this base to refresh UI
      await utils.table.getByBaseId.invalidate({ baseId })
      toast.success("Table created successfully")
      onCreating?.(false)
    //  resetAndClose()
    },
    onError: (error) => {
      toast.error("Failed to create table: " + error.message)
      onCreating?.(false)
    },
  })

  const resetAndClose = () => {
    setNewTableName("")
    onClose()
  }

  const handleCreate = () => {
    if (!newTableName.trim()) return

    mutate({
      name: newTableName.trim(),
      baseId,
    })
    resetAndClose();
  }

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-table-title"
    >
      <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 id="create-table-title" className="text-lg font-semibold">
            Create New Table
          </h3>
          <button
            onClick={resetAndClose}
            className="rounded p-2 hover:bg-gray-100 focus:outline-none"
            aria-label="Close modal"
            type="button"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label htmlFor="tableName" className="mb-1 block font-medium text-gray-700">
          Name
        </label>
        <input
          id="tableName"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Enter table name"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          autoFocus
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading && newTableName.trim()) {
              e.preventDefault()
              handleCreate()
            }
          }}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={resetAndClose}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
            type="button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newTableName.trim() || isLoading}
            className={`rounded px-4 py-2 font-semibold text-white flex items-center gap-2 ${
              newTableName.trim() && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-blue-300"
            }`}
            type="button"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Creating..." : "Create Table"}
          </button>
        </div>
      </div>
    </div>
  )
}
