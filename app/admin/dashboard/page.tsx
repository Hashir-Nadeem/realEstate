'use client'

import { useState, useEffect } from 'react'
import { getCitiesFromMap } from '@/data/city-locality-map'
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [city, setCity] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const cities = getCitiesFromMap()
  const router = useRouter()
const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending'>('All')

const handleToggleStatus = async (id: string, currentStatus: string) => {
  try {
    const newStatus = currentStatus === "Approved" ? "Pending" : "Approved"

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/properties/status/${id}?status=${newStatus}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    console.log('Status update response:', res)

    if (!res.ok) throw new Error("Status update failed")

    setProperties((prev) =>
      prev.map((p) => {
        const pid = p._id?.$oid || p.id
        if (pid === id) {
          return { ...p, status: newStatus }
        }
        return p
      })
    )
  } catch (error) {
    console.error(error)
    alert("Error updating status")
  }
}
  // ✅ Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties`
        )

        const data = await res.json()
        setProperties(data?.data || data || [])

      } catch (error) {
        console.error('Error fetching properties', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // ✅ Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [city])

  // ✅ Delete property
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this property?")
    if (!confirmDelete) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      if (!res.ok) throw new Error("Delete failed")

      setProperties((prev) =>
        prev.filter((p) => {
          const pid = p._id?.$oid || p.id
          return pid !== id
        })
      )

      alert("Property deleted successfully")
    } catch (error) {
      console.error(error)
      alert("Error deleting property")
    }
  }

const filteredProperties = properties.filter((p) => {
  const cityMatch = !city || p.city === city

  const normalizedStatus = (p.status || "").trim().toLowerCase()
  const selectedStatus = statusFilter.toLowerCase()

  const statusMatch =
    statusFilter === "All" || normalizedStatus === selectedStatus

  return cityMatch && statusMatch
})
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-4">

      {/* FILTER BAR */}
      <div className="bg-white shadow rounded p-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-700">
            Filter by City:
          </label>

          <select
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All Cities</option>

            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Total: {filteredProperties.length}
        </div>
      </div>
      <div className="flex items-center gap-2">
  <button
    onClick={() => setStatusFilter('All')}
    className={`px-3 py-1 rounded ${
      statusFilter === 'All' ? 'bg-red-500 text-white' : 'bg-gray-200'
    }`}
  >
    All
  </button>

  <button
    onClick={() => setStatusFilter('Approved')}
    className={`px-3 py-1 rounded ${
      statusFilter === 'Approved' ? 'bg-green-500 text-white' : 'bg-gray-200'
    }`}
  >
    Approved
  </button>

  <button
    onClick={() => setStatusFilter('Pending')}
    className={`px-3 py-1 rounded ${
      statusFilter === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'
    }`}
  >
    Pending
  </button>
</div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left border-collapse">

          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">City</th>
              <th className="p-3">Locality</th>
              <th className="p-3">Price</th>
              <th className="p-3">Area</th>
              <th className="p-3">Beds</th>
              <th className="p-3">Type</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Created By</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedProperties.map((p: any, index) => {
              const id = p._id?.$oid || p.id

              return (
                <tr
                  key={id}
                  className={`border-b ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-red-50`}
                >
                  <td className="p-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="p-3">
                    {p.uploadedImages?.[0] ? (
                      <img
                        src={`${window.location.origin}${p.uploadedImages[0]}`}
                        className="w-16 h-12 object-cover rounded border"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No Image
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-medium">{p.title || '-'}</td>
                  <td className="p-3">{p.city || '-'}</td>
                  <td className="p-3">{p.locality || '-'}</td>
                  <td className="p-3">₹{p.price || ''}</td>
                  <td className="p-3">{p.area} {p.areaUnit}</td>
                  <td className="p-3">{p.bedrooms || '-'}</td>
                  <td className="p-3">{p.youAreHereTo || '-'}</td>
                  <td className="p-3">+91{p.whatsapp || '-'}</td>
                  <td className="p-3">{p.createdByUser || '-'}</td>

                  <td className="p-3">
  <span
    className={`px-2 py-1 text-xs rounded ${
      p.status === 'Approved'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {p.status || 'N/A'}
  </span>
</td>

                  <td className="p-3 space-x-2">
                   

                     <button
  onClick={() => handleToggleStatus(id, p.status)}
  className={`relative inline-flex items-center h-6 w-11 rounded-full transition ${
    p.status === "Approved" ? "bg-green-500" : "bg-gray-300"
  }`}
>
  <span
    className={`inline-block w-4 h-4 transform bg-white rounded-full transition ${
      p.status === "Approved" ? "translate-x-6" : "translate-x-1"
    }`}
  />
</button>

                    <button
                      onClick={() => handleDelete(id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}

            {!loading && paginatedProperties.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center p-6 text-gray-500">
                  No properties found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={12} className="text-center p-6">
                  Loading...
                </td>
              </tr>
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