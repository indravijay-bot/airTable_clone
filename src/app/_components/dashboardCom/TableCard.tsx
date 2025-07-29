"use client";

import { TableIcon } from "lucide-react";
import type { Table } from "~/app/dashboard/types";

type Props = {
  table: Table;
  onClick: () => void;
};

export default function TableCard({ table, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <TableIcon className="h-5 w-5 text-blue-600" />
        <span>{table.name}</span>
      </div>
    </div>
  );
}
