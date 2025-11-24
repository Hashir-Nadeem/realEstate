'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, List, HelpCircle, CircleDollarSign, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const tabs = [
  { name: "Search", icon: Search, href: "/" },
  { name: "List", icon: List, href: "/list" },
  { name: "Help", icon: HelpCircle, href: "/help" },
  { name: "Services", icon: CircleDollarSign, href: "/advertising" },
]

export const BottomNavigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || 
            (tab.name === "Help" && pathname.startsWith('/help')) ||
            (tab.name === "Search" && pathname === "/")

          if (tab.name === "Services") {
            return (
              <Link
                href={tab.href}
                key={tab.name}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon className="w-6 h-6 mb-1 text-black" strokeWidth={1.75} />
                <span className="text-xs font-medium">{tab.name}</span>
              </Link>
            )
          }

          return (
            <Link 
              href={tab.href} 
              key={tab.name} 
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.name === 'Services' ? (
                <Icon className="w-6 h-6 mb-1 text-black" strokeWidth={1.75} />
              ) : (
                <Icon className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          )
        })}

        {/* User Profile/Login Section */}
        {isAuthenticated ? (
          <div className="flex flex-col items-center py-2 px-3 rounded-lg">
            <div className="relative group">
              <button className="flex flex-col items-center text-gray-600 hover:text-gray-800">
                <User className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium truncate max-w-12">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            href="/login"
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </div>
  )
}