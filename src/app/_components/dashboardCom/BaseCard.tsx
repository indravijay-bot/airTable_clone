import { Database } from "lucide-react";
import type { Base } from "~/app/dashboard/types";

type Props = {
  base: Base;
  onClick: () => void;
};

export default function BaseCard({ base, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <Database className="h-5 w-5 text-blue-600" />
        <span>{base.name}</span>
      </div>
      <p className="mt-1 text-gray-600">{base.description}</p>
    </div>
  );
}
