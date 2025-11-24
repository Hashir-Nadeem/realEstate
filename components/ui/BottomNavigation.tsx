'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, List, HelpCircle, CircleDollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'

const tabs = [
  { name: "Search", icon: Search, href: "/" },
  { name: "List", icon: List, href: "/list" },
  { name: "Help", icon: HelpCircle, href: "/help" },
  { name: "Services", icon: CircleDollarSign, href: "/advertising" },
]

export const BottomNavigation = () => {
  const pathname = usePathname()
  const [safeBottom, setSafeBottom] = useState(0)

  // Capture iOS safe-area inset if available
  useEffect(() => {
    const inset = Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sat-bottom')
        .trim()
    )
    // Fallback using env if supported
    const testDiv = document.createElement('div')
    testDiv.style.paddingBottom = 'env(safe-area-inset-bottom)'
    document.body.appendChild(testDiv)
    const applied = parseFloat(getComputedStyle(testDiv).paddingBottom || '0')
    document.body.removeChild(testDiv)
    setSafeBottom(isNaN(applied) ? inset || 0 : applied)
  }, [])

  return (
    <div
      role="navigation"
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-2 z-50 shadow-lg backdrop-blur-sm"
      style={{
        paddingBottom: `calc(${safeBottom || 0}px + 0.5rem)`,
        transform: 'translateZ(0)', // Prevent iOS paint issues
      }}
    >
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive =
            pathname === tab.href ||
            (tab.name === 'Help' && pathname.startsWith('/help')) ||
            (tab.name === 'Search' && pathname === '/')

          return (
            <Link
              href={tab.href}
              key={tab.name}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
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
      </div>
    </div>
  )
}