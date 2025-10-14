'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

export const ConditionalFooter = () => {
  const pathname = usePathname()
  
  // Hide footer only on home page
  if (pathname === '/') {
    return null
  }

  return <Footer />
}
