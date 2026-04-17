'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type User = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function UserDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchUser = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/Auth/${id}`
        )

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error('Error fetching user', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading user details...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        User not found
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-white text-red-600 flex items-center justify-center font-bold text-xl shadow">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {user.fullName}
              </h1>
              <p className="text-sm opacity-90">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="bg-white text-red-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="bg-white shadow-md rounded-xl p-6">

        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
          User Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <p className="text-gray-500 text-sm">Full Name</p>
            <p className="font-medium text-gray-800">
              {user.fullName}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium text-gray-800">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Phone Number</p>
            <p className="font-medium text-gray-800">
              {user.phoneNumber}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Role</p>
            <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
              {user.role}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 text-xs rounded-full font-medium ${
                user.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Created At</p>
            <p className="font-medium text-gray-800">
              {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}