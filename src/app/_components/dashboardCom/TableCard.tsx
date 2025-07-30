"use client";

import type React from "react";

import { TableIcon, Trash2 } from "lucide-react";
import type { Table } from "~/app/dashboard/types";
import { useRouter } from "next/navigation";

type Props = {
  table: Table;
  onDelete: (tableId: string) => void;
  isDeleting?: boolean;
};

export default function TableCard({
  table,
  onDelete,
  isDeleting = false,
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    console.log("Navigating to table:", table.id); // Debug log
    router.push(`/dashboard/table/${table.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDeleting) {
      onDelete(table.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={isDeleting ? -1 : 0}
      onKeyDown={(e) => {
        if (!isDeleting && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`relative cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isDeleting ? "cursor-not-allowed opacity-50" : "hover:shadow-md"
      }`}
    >
      {/* Delete button - top right */}
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className={`absolute top-3.5 right-2 flex items-center space-x-1 rounded px-2 py-1 text-sm font-semibold transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none ${
          isDeleting
            ? "cursor-not-allowed bg-red-50 text-red-400 opacity-50"
            : "text-red-600 hover:bg-red-100"
        }`}
        aria-label={`Delete table ${table.name}`}
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? <span>Deleting...</span> : null}{" "}
      </button>

      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <TableIcon className="h-5 w-5 text-blue-600" />
        <span>{table.name}</span>
      </div>
    </div>
  );
}
