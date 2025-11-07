"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Search, List, HelpCircle, Settings, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PostPropertyButton } from "@/components/ui/PostPropertyButton"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useMapViewState, City } from "@/hooks/useMapViewState"
import Link from "next/link"
import AuthLoginCTA from '@/components/ui/AuthLoginCTA'

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen bg-gray-100 animate-pulse" />,
})

const cities: City[] = [
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Fremont", lat: 37.5485, lng: -121.9886 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "New Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Vijayawada", lat: 16.5062, lng: 80.648 },
]

const tabs = [
  { name: "Search", icon: Search },
  { name: "List", icon: List },
  { name: "Help", icon: HelpCircle },
  { name: "Services", icon: Settings },
]

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState("Search")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [initialLocationSet, setInitialLocationSet] = useState(false)
  const [isRecentering, setIsRecentering] = useState(false)

  const { 
    userLocation, 
    isLocating, 
    locationError, 
    getCurrentLocation,
    clearError 
  } = useGeolocation()

  const {
    selectedCity,
    isViewingCurrentLocation,
    handleCitySelect,
    handleShowCurrentLocation,
    setIsViewingCurrentLocation,
    zoom,
    handleZoomChange,
  } = useMapViewState(userLocation)

  const filteredCities = cities.filter((city) => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Initialize location on app start - fix the state management
  useEffect(() => {
    if (!initialLocationSet) {
      getCurrentLocation(true)
        .then(() => {
          setInitialLocationSet(true)
          setIsViewingCurrentLocation(true)
          console.log('Initial location set, viewing current location: true')
        })
        .catch((error) => {
          console.error("Failed to get initial location:", error)
          // Default to Bangalore if location access denied
          setInitialLocationSet(true)
          setIsViewingCurrentLocation(false)
          console.log('Location failed, viewing current location: false')
        })
    }
  }, [initialLocationSet, getCurrentLocation, setIsViewingCurrentLocation])

  const handleCitySelectWrapper = (city: City) => {
    console.log('City selected:', city.name)
    handleCitySelect(city)
    setSearchQuery(city.name)
    setShowCityDropdown(false)
  }

  const handleRecenterToUserLocation = async () => {
    console.log('HomePage: Recentering to user location')
    setIsRecentering(true)
    try {
      await getCurrentLocation(false)
      handleShowCurrentLocation()
      setSearchQuery("")
      console.log('HomePage: Recenter complete, should be viewing current location')
      // Keep recentering state for a bit longer to prevent flickering
      setTimeout(() => setIsRecentering(false), 1000)
    } catch (error) {
      console.error("Error getting location:", error)
      setIsRecentering(false)
    }
  }

  const handleMapViewChange = (viewingCurrentLocation: boolean) => {
    // Ignore view changes during recentering to prevent flickering
    if (isRecentering) return;
    
    // Only update if the state is actually different
    if (viewingCurrentLocation !== isViewingCurrentLocation) {
      console.log('🔥 HomePage: Map view change callback triggered!');
      console.log('HomePage: New viewingCurrentLocation:', viewingCurrentLocation);
      setIsViewingCurrentLocation(viewingCurrentLocation);
    }
  }

  // Debug log for button state with more detail  
  useEffect(() => {
    console.log('🔄 HomePage: Button state effect triggered');
    console.log('HomePage: isViewingCurrentLocation:', isViewingCurrentLocation);
    console.log('HomePage: Selected city:', selectedCity?.name || 'none');
    console.log('HomePage: User location:', userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'none');
  }, [isViewingCurrentLocation, selectedCity, userLocation])

  function handleSearchChange(value: string): void {
    setSearchQuery(value)

    const trimmed = value.trim()
    if (!trimmed) {
      setShowCityDropdown(false)
      return
    }

    // show dropdown when there's something typed
    setShowCityDropdown(true)

    // If the user typed an exact city name, select it immediately
    const exactMatch = cities.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (exactMatch) {
      console.log("handleSearchChange: exact city match:", exactMatch.name)
      handleCitySelect(exactMatch)
      setSearchQuery(exactMatch.name)
      setShowCityDropdown(false)
    }
  }
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
                    onClick={() => handleCitySelectWrapper(city)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 text-lg transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </Card>
            )}
          </div>

          {/* Login CTA (right of search, left of location) */}
          <div className="flex-shrink-0">
            {/* show login when not authenticated, otherwise show user's first name */}
            <AuthLoginCTA />
          </div>

          {/* Current Location Button */}
          <Button
            onClick={handleRecenterToUserLocation}
            disabled={isLocating}
            variant="outline"
            size="lg"
            className="px-3 py-3 border-gray-300 bg-transparent hover:bg-gray-50 transition-colors"
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
            <button 
              onClick={clearError}
              className="text-xs text-yellow-600 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Location Accuracy Display removed for home/search page */}

        {/* Post Property CTA */}
        <div className="mb-2">
          <PostPropertyButton
            isViewingCurrentLocation={isViewingCurrentLocation}
            onShowCurrentLocation={handleRecenterToUserLocation}
            isLocating={isLocating || isRecentering}
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {userLocation ? (
          <MapComponent
            selectedCity={selectedCity}
            userLocation={userLocation}
            cities={cities}
            recenterTrigger={isLocating ? userLocation : null}
            showUserLocationOnStart={isViewingCurrentLocation && initialLocationSet}
            onViewChange={handleMapViewChange}
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

            if (tab.name === "List") {
              return (
                <Link href="/list" key={tab.name} className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-gray-800 transition-colors">
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </Link>
              )
            }

            if (tab.name === "Help") {
              return (
                <Link href="/help" key={tab.name} className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-gray-800 transition-colors">
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </Link>
              )
            }

            if (tab.name === "Services") {
              return (
                <Link href="/post-property" key={tab.name} className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-gray-800 transition-colors">
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
