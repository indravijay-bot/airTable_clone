import { Database, Trash2 } from "lucide-react";
import type { Base } from "~/app/dashboard/types";

type Props = {
  base: Base;
  onClick: () => void;
  onDelete: (baseId: string) => void;
};

export default function BaseCard({ base, onClick, onDelete }: Props) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    onDelete(base.id );
  };

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {/* Delete button - top right */}
      <button
        type="button"
        onClick={handleDeleteClick}
        className="absolute top-2 right-2 flex items-center space-x-1 rounded px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-400 focus:outline-none"
        aria-label={`Delete base ${base.name}`}
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>

      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <Database className="h-5 w-5 text-blue-600" />
        <span>{base.name}</span>
      </div>
      <p className="mt-1 text-gray-600">{base.description}</p>
    </div>
  );
}
