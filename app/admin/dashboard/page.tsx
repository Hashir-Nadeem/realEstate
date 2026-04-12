'use client'

import { useState, useEffect } from 'react'
import { getCitiesFromMap } from '@/data/city-locality-map'
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [city, setCity] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const cities = getCitiesFromMap()
  const router = useRouter()

  // ✅ Fetch from API
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

  const handleDelete = async (id: string) => {
  const confirmDelete = confirm("Are you sure you want to delete this property?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`, // ✅ correct route
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔥 REQUIRED
        },
      }
    );

    if (!res.ok) throw new Error("Delete failed");

    // ✅ Remove from UI instantly
    setProperties((prev) =>
      prev.filter((p) => {
        const pid = p._id?.$oid || p.id
        return pid !== id
      })
    );

    alert("Property deleted successfully");
  } catch (error) {
    console.error(error);
    alert("Error deleting property");
  }
};
return (
  <div className="space-y-4">

    {/* ✅ FILTER BAR */}
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

      {/* Optional right side (future search / count) */}
      <div className="text-sm text-gray-500">
        Total: {properties.length}
      </div>

    </div>

    {/* ✅ TABLE */}
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
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {properties
            .filter(p => !city || p.city === city)
            .map((p: any, index) => {
              const id = p._id?.$oid || index

              return (
                <tr
                  key={id}
                  className={`border-b ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-red-50`}
                >
                  <td className="p-3">{id}</td>

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

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      {p.status || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                  <button
                      onClick={() => {
                        const id = p._id?.$oid || p.id
                        router.push(`/admin/dashboard/edit/${id}`)
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                    Delete
                  </button>
                  </td>
                </tr>
              )
            })}
        </tbody>

      </table>
    </div>

  </div>
)
}