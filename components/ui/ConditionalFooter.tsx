'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

export const ConditionalFooter = () => {
  const pathname = usePathname()
  
  // Hide footer on home page and the help page (including nested help routes)
  // e.g. '/', '/help', '/help/...'
  if (
    pathname === '/' ||
    pathname === '/help' ||
    pathname === '/list' ||
    pathname === '/post-property' ||
    (pathname && pathname.startsWith('/help/'))
  ) {
    return null
  }

  return <Footer />
}
