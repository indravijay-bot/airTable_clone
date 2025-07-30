"use client"

import { TableIcon } from "lucide-react"
import type { Table } from "~/app/dashboard/types"
import { useRouter } from "next/navigation"

type Props = {
  table: Table
}

export default function TableCard({ table }: Props) {
  const router = useRouter()

  const handleClick = () => {
    console.log("Navigating to table:", table.id) // Debug log
    router.push(`/dashboard/table/${table.id}`)
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      className="cursor-pointer rounded border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <TableIcon className="h-5 w-5 text-blue-600" />
        <span>{table.name}</span>
      </div>
    </div>
  )
}
