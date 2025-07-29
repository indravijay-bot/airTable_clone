"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function CreateTableModal({ onClose }: Props) {
  const [newTableName, setNewTableName] = useState("");

  const handleCreate = () => {
    // TODO: Integrate with backend or state management
    onClose();
    setNewTableName("");
  };

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
            onClick={onClose}
            className="rounded p-2 hover:bg-gray-100 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
              onClose();
              setNewTableName("");
            }}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
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
  );
}
