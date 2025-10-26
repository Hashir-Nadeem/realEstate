import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Footer } from '@/components/ui/Footer'
import { ConditionalFooter } from '@/components/ui/ConditionalFooter'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const metadata: Metadata = {
  title: 'Zamindar - Find Your Dream Property',
  description: 'Find and post properties for sale and rent. Connect with buyers and sellers.',
  generator: 'Zamindar App',
  icons: {
    icon: '/zamindar_logo_transparent.png',
    shortcut: '/zamindar_logo_transparent.png',
    apple: '/zamindar_logo_transparent.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} min-h-screen flex flex-col`}>
        <main className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  )
}