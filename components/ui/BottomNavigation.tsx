'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, List, HelpCircle, Settings } from 'lucide-react'

const tabs = [
  { name: "Search", icon: Search, href: "/" },
  { name: "List", icon: List, href: "/list" },
  { name: "Help", icon: HelpCircle, href: "/help" },
  { name: "Services", icon: Settings, href: "/post-property" },
]

export const BottomNavigation = () => {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || 
            (tab.name === "Help" && pathname.startsWith('/help')) ||
            (tab.name === "Search" && pathname === "/")

          return (
            <Link 
              href={tab.href} 
              key={tab.name} 
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}