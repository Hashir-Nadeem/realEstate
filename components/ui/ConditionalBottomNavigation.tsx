'use client'

import { usePathname } from 'next/navigation'
import { BottomNavigation } from './BottomNavigation'

export const ConditionalBottomNavigation = () => {
  const pathname = usePathname()

  // Hide only on property detail pages; show everywhere else including home & auth pages
  if (pathname.startsWith('/property/')) {
    return null
  }

  return <BottomNavigation />
}