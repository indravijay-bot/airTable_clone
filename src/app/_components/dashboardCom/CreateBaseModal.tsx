"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function CreateBaseModal({ onClose }: Props) {
  const [newBaseName, setNewBaseName] = useState("");
  const [newBaseDescription, setNewBaseDescription] = useState("");

  const handleCreate = () => {
    // TODO: Integrate with backend or state management
    onClose();
    setNewBaseName("");
    setNewBaseDescription("");
  };

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-base-title"
    >
      <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 id="create-base-title" className="text-lg font-semibold">
            Create New Base
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
              onClose();
              setNewBaseName("");
              setNewBaseDescription("");
            }}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
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
  );
}
