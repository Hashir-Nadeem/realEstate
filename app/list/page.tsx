"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, List, HelpCircle, Settings } from "lucide-react"
import { generatePropertyPopupContent } from "@/components/map/PropertyPopupContent"
import { ListPageHeader } from "@/components/ListPageHeader"

const tabs = [
  { name: "Search", icon: Search },
  { name: "List", icon: List },
  { name: "Help", icon: HelpCircle },
  { name: "Services", icon: Settings },
]

export default function ListPage() {
  const [selectedTab, setSelectedTab] = useState("List")
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

    // Filter by property type (
    // r sale properties)
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

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedTab === tab.name

            if (tab.name === "Search") {
              return (
                <Link href="/" key={tab.name} className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-gray-800 transition-colors">
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </Link>
              )
            }

            return (
              <button
                key={tab.name}
                onClick={() => setSelectedTab(tab.name)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
