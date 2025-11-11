'use client'

import { usePathname } from 'next/navigation'
import { BottomNavigation } from './BottomNavigation'

export const ConditionalBottomNavigation = () => {
  const pathname = usePathname()

  // Don't show on home page (it has its own), auth pages, or property detail pages
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/post-property' ||
    pathname.startsWith('/property/')
  ) {
    return null
  }

  return <BottomNavigation />
}