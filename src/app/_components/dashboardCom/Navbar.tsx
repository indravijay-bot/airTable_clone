"use client";
import { ChevronDown, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <h1 className="text-xl font-bold text-gray-900 select-none">Airtable Clone</h1>

      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
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
  );
}
