'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const path = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const menu = [
    { name: 'Properties', href: '/admin/dashboard' },
    { name: 'Users', href: '/admin/users' },
  ]

const handleLogout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const token = localStorage.getItem("token");

    if (refreshToken && token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.replace("/login");
  }
};

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">

        <div className="p-5 border-b border-gray-800">
          <h2 className="text-2xl font-bold tracking-wide">
            Admin Panel
          </h2>
        </div>

        <nav className="p-4 space-y-2">

          {/* Menu Links */}
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition ${
                path === item.href
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* 🔥 Logout inside menu */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full text-left px-4 py-2 rounded-lg transition bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>

        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white shadow px-6 py-4">
          <h1 className="text-lg font-semibold">
            Admin Dashboard
          </h1>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}