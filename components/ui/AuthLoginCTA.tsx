'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AuthLoginCTA() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
          Login
        </button>
      </Link>
    )
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'User'

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition"
    >
      Logout ({firstName})
    </button>
  )
}
