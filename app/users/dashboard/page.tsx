"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);


useEffect(() => {
  const initAuth = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // ✅ SET USER ID HERE
        setUserId(parsedUser.id); // or parsedUser.userId (depends on your backend)
      }
    }
    setLoading(false);
  };

  initAuth();
}, []);

  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  // ================= FETCH =================
 useEffect(() => {
  if (!userId) return;

  const fetchProperties = async () => {
    try {
     const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/properties/byuser/${userId}`
);

      const data = await res.json();
     
      setProperties(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, [userId]);
  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">🏡 My Dashboard</h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto p-6">

        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Properties</h2>
          <p className="text-gray-500 text-sm">
            Manage all your listed properties
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-gray-500">Loading properties...</div>
        )}

        {/* EMPTY */}
        {!loading && properties.length === 0 && (
          <div className="text-gray-500 bg-white p-6 rounded-xl shadow text-center">
            No properties found
          </div>
        )}

        {/* LIST */}
        <div className="grid gap-5">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition flex gap-5 items-center"
            >
              


              {/* IMAGE */}
          <img
  src={
    p.uploadedImages?.[0]
      ? p.uploadedImages[0].startsWith("data:image")
        ? p.uploadedImages[0]
        : `data:image/jpeg;base64,${p.uploadedImages[0]}`
      : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop"
  }
  alt="property"
  className="w-32 h-24 object-cover rounded-xl"
/>
              {/* DETAILS */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{p.title}</h3>

                <p className="text-gray-600 text-sm mt-1">
                  ₹{p.price} {p.priceUnit}
                </p>

                <p className="text-gray-500 text-sm">
                  {p.locality}, {p.city}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {p.category} • {p.area} {p.areaUnit}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    p.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}