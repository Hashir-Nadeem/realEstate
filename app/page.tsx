"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PostPropertyButton } from "@/components/ui/PostPropertyButton"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useMapViewState, City } from "@/hooks/useMapViewState"
import { apiRequest } from "@/lib/api"

const MapComponent = dynamic(
  () => import("@/components/map-component"),
  { ssr: false }
)

const cities: City[] = [
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "New Delhi", lat: 28.6139, lng: 77.209 },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)

  const { userLocation, isLocating, getCurrentLocation } =
    useGeolocation()

  const {
    selectedCity,
    isViewingCurrentLocation,
    handleCitySelect,
    handleShowCurrentLocation,
  } = useMapViewState(userLocation)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoadingProperties(true)
        const data = await apiRequest<any[]>(
          `/properties?page=1&pageSize=50`
        )
        setProperties(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingProperties(false)
      }
    }
    fetchAll()
  }, [])

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* HEADER */}
      <div className="p-4 bg-white shadow z-10">

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search City Name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowCityDropdown(true)
              }}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

            {showCityDropdown && searchQuery && (
              <Card className="absolute top-full left-0 right-0 z-20 bg-white shadow-lg">
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      handleCitySelect(city)
                      setSearchQuery(city.name)
                      setShowCityDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50"
                  >
                    {city.name}
                  </button>
                ))}
              </Card>
            )}
          </div>

          <Button
            onClick={async () => {
              await getCurrentLocation(false)
              handleShowCurrentLocation()
              setSearchQuery("")
            }}
            variant="outline"
          >
            <MapPin className="w-5 h-5 text-blue-600" />
          </Button>
        </div>

        <PostPropertyButton
          isViewingCurrentLocation={isViewingCurrentLocation}
          onShowCurrentLocation={handleShowCurrentLocation}
          isLocating={isLocating}
        />
      </div>

      {/* MAP */}
      <div className="flex-1 relative">
        {loadingProperties && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 shadow rounded z-20">
            Loading properties...
          </div>
        )}

        <MapComponent
          properties={properties}
          selectedCity={selectedCity}
        />
      </div>
    </div>
  )
}