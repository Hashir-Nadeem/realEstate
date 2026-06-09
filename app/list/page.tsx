"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { generatePropertyPopupContent } from "@/components/map/PropertyPopupContent"
import { ListPageHeader } from "@/components/ListPageHeader"

export default function ListPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [city, setCity] = useState("Delhi")
  const [locality, setLocality] = useState("All")
  const [saleRentFilter, setSaleRentFilter] = useState("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([])

  // ✅ Fetch from API
 useEffect(() => {
  const fetchProperties = async () => {
    try {
      setIsLoading(true)

     const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/properties/GetAllProperties?page=1&pageSize=50`,
  { cache: "no-store" }
)

      if (!res.ok) throw new Error("Failed to fetch")

   const data = await res.json()

const list =
  Array.isArray(data)
    ? data
    : data?.items
    ? data.items
    : data?.data
    ? data.data
    : []

setProperties(list)

console.log("Properties fetched:", list.length)

      
    } catch (err) {
      console.error("Properties API error:", err)
      setProperties([])
      console.log("Properties fetched: 0")
    } finally {
      setIsLoading(false)
    }
  }

  fetchProperties()
}, [])

 useEffect(() => {
  let result = [...properties]

  if (city) {
    result = result.filter(p => p.city === city)
  }

  if (locality !== "All") {
    result = result.filter(p => p.locality === locality)
  }

  

  // ✅ Property type filter should NOT depend on sale/rent logic
  if (propertyTypeFilter.length > 0) {
    result = result.filter(p =>
      propertyTypeFilter.includes(p.propertyType) // 👈 IMPORTANT FIX
    )
  }

  setFilteredProperties(result)
}, [properties, city, locality, saleRentFilter, propertyTypeFilter])
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ListPageHeader
        city={city}
        locality={locality}
        saleRentFilter={saleRentFilter}
        propertyTypeFilter={propertyTypeFilter}
        onCityChange={setCity}
        onLocalityChange={setLocality}
        onSaleRentChange={setSaleRentFilter}
        onPropertyTypeChange={setPropertyTypeFilter}
      />

      <main className="flex-grow container mx-auto py-6 px-4 pb-28">
        {isLoading ? (
          <div className="text-center text-gray-500">
            Loading properties...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block"
                >
                 <div
  dangerouslySetInnerHTML={{
    __html: generatePropertyPopupContent(property),
  }}
/>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <h2 className="text-xl font-semibold">No properties found</h2>
                <p>Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}