"use client"

import { Menu, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

type NavbarProps = {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session } = useSession()
  const userName = session?.user?.name || "Guest"

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 focus:outline-none"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4 text-gray-600" />
        </button>
        <div className="text-lg font-semibold text-gray-900">Airtable Clone</div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
        >
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-sm font-medium text-gray-700">{userName}</span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => {
                setIsUserMenuOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
