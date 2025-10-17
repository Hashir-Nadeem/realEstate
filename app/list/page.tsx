"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { generatePropertyPopupContent } from "@/components/map/PropertyPopupContent"
import { ListPageHeader } from "@/components/ListPageHeader"

export default function ListPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [city, setCity] = useState("Hyderabad")
  const [locality, setLocality] = useState("All")
  const [saleRentFilter, setSaleRentFilter] = useState("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/properties")
        const data = await res.json()
        setProperties(data || [])
      } catch (error) {
        console.error("Failed to fetch properties:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperties()
  }, [])

  useEffect(() => {
    let result = properties

    // Filter by city
    if (city) {
      result = result.filter(p => p.city === city)
    }

    // Filter by locality
    if (locality !== "All") {
      result = result.filter(p => p.locality === locality)
    }

    // Filter by sale/rent
    if (saleRentFilter !== "all") {
      if (saleRentFilter === "sale") {
        result = result.filter(p => p.type.startsWith("sale"))
      } else {
        result = result.filter(p => p.type === "rental")
      }
    }

    // Filter by property type (for sale properties)
    if (saleRentFilter === "sale" && propertyTypeFilter.length > 0) {
      result = result.filter(p => propertyTypeFilter.includes(p.type))
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
      <main className="flex-grow container mx-auto py-6 px-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <Link key={property.id} href={`/property/${property.id}`} className="block">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: generatePropertyPopupContent(property, { showCloseButton: false }),
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
