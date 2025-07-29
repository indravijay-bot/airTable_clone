import {
  Database,
  TableIcon,
  Plus,
} from "lucide-react"

export function ContentArea() {
  const bases = [
    { id: "base1", name: "Sales Database", description: "Contains sales records" },
    { id: "base2", name: "HR Records", description: "Employee information" },
  ]

  const tables = [
    { id: "table1", name: "Customers" },
    { id: "table2", name: "Orders" },
  ]

  // Let's simulate no base selected (change as needed)
  const selectedBase: string | null = null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!selectedBase ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 lg:hidden">Your Bases</h2>

          {bases.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bases yet</h3>
              <p className="text-gray-600 mb-4">Create your first base to get started</p>
              <button
                type="button"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Base
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bases.map((base) => (
                <div
                  key={base.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-white border border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="h-5 w-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">{base.name}</h3>
                  </div>
                  <p className="text-gray-600">{base.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 lg:hidden">
            {bases.find((b) => b.id === selectedBase)?.name} Tables
          </h2>

          {tables.length === 0 ? (
            <div className="text-center py-12">
              <TableIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tables yet</h3>
              <p className="text-gray-600 mb-4">Create your first table to start organizing data</p>
              <button
                type="button"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-white border border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-center space-x-2">
                    <TableIcon className="h-5 w-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">{table.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
