'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type User = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('')

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // ✅ Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/Auth/`
        )

        const data = await res.json()
        setUsers(data || [])
      } catch (error) {
        console.error('Error fetching users', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // ✅ Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [role])

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?")
    if (!confirmDelete) return

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/Auth/${id}`,
        {
          method: "DELETE",
        }
      )

      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  // ✅ Filter + Pagination
  const filteredUsers = users.filter(
    (u) => !role || u.role === role
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-4">

      {/* FILTER BAR */}
      <div className="bg-white shadow rounded p-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-700">
            Filter by Role:
          </label>

          <select
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Total: {filteredUsers.length}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left border-collapse">

          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u, index) => (
                <tr
                  key={u.id}
                  className={`border-b ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-red-50`}
                >
                  <td className="p-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phoneNumber}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        u.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-3">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 space-x-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm inline-block"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">

          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}

    </div>
  )
}