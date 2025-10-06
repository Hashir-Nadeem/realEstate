"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, List, HelpCircle, Settings, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen bg-gray-100 animate-pulse" />,
})

const cities = [
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Fremont", lat: 37.5485, lng: -121.9886 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "New Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Vijayawada", lat: 16.5062, lng: 80.648 },
]

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState("Search")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [selectedCity, setSelectedCity] = useState<(typeof cities)[0] | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [initialLocationSet, setInitialLocationSet] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const filteredCities = cities.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getCurrentLocation = (isInitial = false) => {
    return new Promise<{ lat: number; lng: number; accuracy: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      let watchId: number | null = null
      let bestAccuracy = Number.POSITIVE_INFINITY
      let bestPosition: GeolocationPosition | null = null
      let timeout: NodeJS.Timeout | null = null
      let resolved = false

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 30000, // 30 seconds
        maximumAge: isInitial ? 0 : 30000, // Fresh for initial, 30s cache for button
      }

      const cleanup = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
          watchId = null
        }
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
      }

      const resolveWithBest = () => {
        if (resolved) return
        resolved = true
        cleanup()

        if (bestPosition) {
          console.log("Final location:", {
            lat: bestPosition.coords.latitude,
            lng: bestPosition.coords.longitude,
            accuracy: bestPosition.coords.accuracy,
          })
          resolve({
            lat: bestPosition.coords.latitude,
            lng: bestPosition.coords.longitude,
            accuracy: bestPosition.coords.accuracy,
          })
        } else {
          reject(new Error("No valid position obtained"))
        }
      }

      // Use watchPosition for continuous updates to get the best accuracy
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const accuracy = position.coords.accuracy
          console.log(`Location update: accuracy ${accuracy}m`, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date(position.timestamp).toLocaleTimeString(),
          })

          // Update if this is more accurate
          if (accuracy < bestAccuracy) {
            bestAccuracy = accuracy
            bestPosition = position
            console.log(`New best accuracy: ${accuracy}m`)
          }

          // If we have very good accuracy (< 20m), resolve immediately
          if (accuracy < 20) {
            console.log("Excellent accuracy achieved, resolving")
            resolveWithBest()
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          if (!resolved) {
            resolved = true
            cleanup()
            reject(error)
          }
        },
        options,
      )

      // Set timeout to resolve with best available after 10 seconds
      timeout = setTimeout(() => {
        console.log("Timeout reached, using best available location")
        resolveWithBest()
      }, 10000)
    })
  }

  useEffect(() => {
    // Get user's current location on app start
    if (!initialLocationSet) {
      setIsLocating(true)
      setLocationError(null)

      getCurrentLocation(true)
        .then((location) => {
          console.log("Initial location obtained:", location)
          setUserLocation(location)
          setInitialLocationSet(true)
          setIsLocating(false)
          setLocationError(null)
        })
        .catch((error) => {
          console.error("Failed to get initial location:", error)
          setLocationError(error.message)

          // Default to Bangalore if location access denied
          const defaultLocation = { lat: 12.9716, lng: 77.5946 }
          setUserLocation(defaultLocation)
          setSelectedCity(cities[0]) // Set Bangalore as default
          setInitialLocationSet(true)
          setIsLocating(false)
        })
    }
  }, [initialLocationSet])

  const handleCitySelect = (city: (typeof cities)[0]) => {
    setSelectedCity(city)
    setSearchQuery(city.name)
    setShowCityDropdown(false)
  }

  const handleRecenterToUserLocation = () => {
    setIsLocating(true)
    setLocationError(null)

    getCurrentLocation(false)
      .then((location) => {
        console.log("Recenter location obtained:", location)
        setUserLocation(location)
        setSelectedCity(null) // Clear selected city to show user location
        setSearchQuery("") // Clear search query
        setIsLocating(false)
        setLocationError(null)
      })
      .catch((error) => {
        console.error("Error getting location:", error)
        setIsLocating(false)

        let errorMessage = "Unable to get your location. "
        if (error.code) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access and try again."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage += "Location request timed out."
              break
            default:
              errorMessage += "An unknown error occurred."
              break
          }
        } else {
          errorMessage += error.message
        }

        setLocationError(errorMessage)
        alert(errorMessage)
      })
  }

  const tabs = [
    { name: "Search", icon: Search },
    { name: "List", icon: List },
    { name: "Help", icon: HelpCircle },
    { name: "Services", icon: Settings },
  ]

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header with Search */}
      <div className="relative z-10 p-4 bg-white shadow-sm">
        {/* Search Bar and Location Button */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search City Name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowCityDropdown(true)
              }}
              onFocus={() => setShowCityDropdown(true)}
              className="w-full pl-10 pr-4 py-3 text-base border-gray-300 rounded-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

            {/* City Dropdown */}
            {showCityDropdown && searchQuery && (
              <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-20 bg-white border shadow-lg">
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 text-lg"
                  >
                    {city.name}
                  </button>
                ))}
              </Card>
            )}
          </div>

          {/* Current Location Button */}
          <Button
            onClick={handleRecenterToUserLocation}
            disabled={isLocating}
            variant="outline"
            size="lg"
            className="px-3 py-3 border-gray-300 bg-transparent"
            title="Get current location"
          >
            {isLocating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <MapPin className="w-5 h-5 text-blue-600" />
            )}
          </Button>
        </div>

        {/* Location Error Display */}
        {locationError && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">{locationError}</p>
          </div>
        )}

        {/* Location Accuracy Display */}
        {userLocation?.accuracy && userLocation.accuracy < 200 && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              Location accuracy: ±{Math.round(userLocation.accuracy)}m{userLocation.accuracy < 50 && " (Excellent)"}
              {userLocation.accuracy >= 50 && userLocation.accuracy < 100 && " (Good)"}
              {userLocation.accuracy >= 100 && " (Fair)"}
            </p>
          </div>
        )}

        {/* Post Property CTA */}
        <Link href="/post-property">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-medium rounded-lg">
            <Plus className="w-5 h-5 mr-2" />
            Post Property Ad for Free!
          </Button>
        </Link>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {userLocation ? (
          <MapComponent
            selectedCity={selectedCity}
            userLocation={userLocation}
            cities={cities}
            recenterTrigger={isLocating ? userLocation : null}
            showUserLocationOnStart={!selectedCity && initialLocationSet}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-2">Getting your precise location...</p>
              <p className="text-xs text-gray-500">Please wait while we find the most accurate position</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedTab === tab.name
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
