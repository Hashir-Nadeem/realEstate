'use client'

import { useEffect, useState } from 'react'

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

  // ✅ Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/Auth/`
        )

        console.log('Fetch users response:', res);
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
const handleDelete = async (id: string) => {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/Auth/${id}`,
      {
        method: "DELETE",
      }
    );

    // ✅ Remove user from UI instantly
    setUsers((prev) => prev.filter((u) => u.id !== id));

  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
  return (
    <div className="space-y-4">

      {/* ✅ FILTER BAR */}
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
          Total: {users.length}
        </div>
      </div>

      {/* ✅ TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left border-collapse">

          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-3">ID</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users
                .filter(u => !role || u.role === role)
                .map((u, index) => (
                  <tr
                    key={u.id}
                    className={`border-b ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-red-50`}
                  >
                    <td className="p-3">{index + 1}</td>

                    <td className="p-3 font-medium">
                      {u.fullName}
                    </td>

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
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Details
                      </button>
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

    </div>
  )
}