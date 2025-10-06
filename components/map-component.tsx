"use client"

import { useEffect, useRef } from "react"
import { propertyData } from "@/data/properties"
import { cityBoundaries } from "@/data/city-boundaries"

interface MapComponentProps {
  selectedCity: { name: string; lat: number; lng: number } | null
  userLocation: { lat: number; lng: number; accuracy?: number } | null
  cities: { name: string; lat: number; lng: number }[]
  recenterTrigger?: { lat: number; lng: number; accuracy?: number } | null
  showUserLocationOnStart?: boolean
}

declare global {
  interface Window {
    L: any
  }
}

export default function MapComponent({
  selectedCity,
  userLocation,
  cities,
  recenterTrigger,
  showUserLocationOnStart = false,
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const cityOutlineRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const accuracyCircleRef = useRef<any>(null)
  const leafletLoaded = useRef(false)

  // Load Leaflet from CDN
  useEffect(() => {
    if (leafletLoaded.current) return

    const loadLeaflet = async () => {
      // Load CSS
      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(cssLink)

      // Load JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = () => {
        leafletLoaded.current = true
        initializeMap()
      }
      document.head.appendChild(script)
    }

    loadLeaflet()
  }, [])

  const getOptimalZoom = (accuracy?: number) => {
    if (!accuracy) return 14 // Default zoom if no accuracy info

    // More conservative zoom levels for better overview
    if (accuracy > 1000) return 11 // Very poor accuracy - city level
    if (accuracy > 500) return 12 // Poor accuracy - district level
    if (accuracy > 200) return 13 // Fair accuracy - neighborhood level
    if (accuracy > 100) return 14 // Good accuracy - area level
    if (accuracy > 50) return 15 // Very good accuracy - street level
    return 16 // Excellent accuracy - building level
  }

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L || mapRef.current || !userLocation) return

    const L = window.L

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    })

    mapRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map)

    // Set initial view with optimal zoom
    const initialZoom = showUserLocationOnStart ? getOptimalZoom(userLocation.accuracy) : 12
    map.setView([userLocation.lat, userLocation.lng], initialZoom)

    // Add user location marker if showing user location on start
    if (showUserLocationOnStart) {
      addUserLocationMarker(userLocation)
    } else {
      // Add city boundary for initial location
      addCityBoundary(userLocation)
    }

    // Create custom icons for different property types
    const createCustomIcon = (type: string) => {
      const colors = {
        "commercial-rent": "#3B82F6", // Blue
        "commercial-sale": "#EF4444", // Red
        rental: "#F97316", // Orange
        sale: "#10B981", // Green
      }

      const color = colors[type as keyof typeof colors] || "#6B7280"

      return L.divIcon({
        html: `
    <div style="position: relative;">
      <div style="
        background-color: ${color}; 
        width: 24px; 
        height: 24px; 
        border-radius: 50% 50% 50% 0; 
        transform: rotate(-45deg);
        border: 2px solid white; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
      <div style="
        position: absolute;
        top: 6px;
        left: 6px;
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
        className: "custom-pin-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })
    }

    // Add property markers using real data
    propertyData.forEach((property) => {
      const marker = L.marker([property.lat, property.lng], {
        icon: createCustomIcon(property.type),
      }).addTo(map)

      marker.bindPopup(`
    <div class="p-3 min-w-[200px]">
      <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
      <p class="text-blue-600 font-bold text-lg mb-1">${property.price}</p>
      <p class="text-xs text-gray-600 mb-1">${property.area}</p>
      <p class="text-xs text-gray-500 capitalize">${property.type.replace("-", " ")}</p>
    </div>
  `)

      markersRef.current.push(marker)
    })
  }

  const addCityBoundary = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.L) return

    const L = window.L
    const map = mapRef.current

    // Remove existing city outline
    if (cityOutlineRef.current) {
      map.removeLayer(cityOutlineRef.current)
      cityOutlineRef.current = null
    }

    // Find the closest city to location
    const closestCity = findClosestCity(location, cities)
    if (closestCity && cityBoundaries[closestCity.name as keyof typeof cityBoundaries]) {
      const boundary = cityBoundaries[closestCity.name as keyof typeof cityBoundaries]
      const polygon = L.polygon(boundary, {
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map)
      cityOutlineRef.current = polygon
    }
  }

  const addUserLocationMarker = (location: { lat: number; lng: number; accuracy?: number }) => {
    if (!mapRef.current || !window.L) return

    const L = window.L
    const map = mapRef.current

    // Remove existing user marker and accuracy circle
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current)
      accuracyCircleRef.current = null
    }

    // Add accuracy circle if available and reasonable
    if (location.accuracy && location.accuracy < 500) {
      const accuracyCircle = L.circle([location.lat, location.lng], {
        radius: location.accuracy,
        color: "#EF4444",
        fillColor: "#EF4444",
        fillOpacity: 0.1,
        weight: 2,
        dashArray: "3, 3",
      }).addTo(map)
      accuracyCircleRef.current = accuracyCircle
    }

    // Add user location marker with enhanced styling
    const pulseAnimation = location.accuracy && location.accuracy < 100 ? "pulse 2s infinite" : "none"
    const userIcon = L.divIcon({
      html: `
    <div style="position: relative;">
      <div style="
        background-color: #EF4444; 
        width: 22px; 
        height: 22px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        animation: ${pulseAnimation};
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
    </style>
  `,
      className: "user-location-marker",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })

    const userMarker = L.marker([location.lat, location.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map)

    const accuracyText = location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ""
    const qualityText = location.accuracy
      ? location.accuracy < 50
        ? " - Excellent"
        : location.accuracy < 100
          ? " - Good"
          : location.accuracy < 200
            ? " - Fair"
            : " - Poor"
      : ""

    userMarker.bindPopup(`
  <div class="p-3 text-center">
    <div class="flex items-center justify-center gap-2 mb-2">
      <div class="w-4 h-4 bg-red-500 rounded-full"></div>
      <span class="font-semibold text-sm">Your Current Location</span>
    </div>
    <p class="text-xs text-gray-600 mb-1">
      ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
    </p>
    ${
      accuracyText
        ? `<p class="text-xs text-gray-500">Accuracy: ${accuracyText}${qualityText}</p>`
        : '<p class="text-xs text-gray-500">Location detected</p>'
    }
  </div>
`)

    userMarkerRef.current = userMarker
  }

  // Add helper function to find closest city
  const findClosestCity = (userLoc: { lat: number; lng: number }, cityList: any[]) => {
    let closestCity = null
    let minDistance = Number.POSITIVE_INFINITY

    cityList.forEach((city) => {
      const distance = Math.sqrt(Math.pow(city.lat - userLoc.lat, 2) + Math.pow(city.lng - userLoc.lng, 2))
      if (distance < minDistance) {
        minDistance = distance
        closestCity = city
      }
    })

    return closestCity
  }

  // Handle city selection
  useEffect(() => {
    if (!mapRef.current || !selectedCity || !window.L) return

    const map = mapRef.current

    // Remove user location marker and accuracy circle when selecting a city
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current)
      accuracyCircleRef.current = null
    }

    // Zoom to selected city
    map.setView([selectedCity.lat, selectedCity.lng], 12)

    // Add city boundary
    addCityBoundary(selectedCity)
  }, [selectedCity])

  // Handle recenter trigger
  useEffect(() => {
    if (!mapRef.current || !recenterTrigger || !window.L) return

    const map = mapRef.current

    // Use optimal zoom based on accuracy
    const zoomLevel = getOptimalZoom(recenterTrigger.accuracy)

    // Center map on the new location
    map.setView([recenterTrigger.lat, recenterTrigger.lng], zoomLevel)

    // Add user location marker
    addUserLocationMarker(recenterTrigger)

    // Remove city boundary when showing user location
    if (cityOutlineRef.current) {
      map.removeLayer(cityOutlineRef.current)
      cityOutlineRef.current = null
    }
  }, [recenterTrigger])

  // Initialize map when Leaflet loads and userLocation is available
  useEffect(() => {
    if (leafletLoaded.current && userLocation && !mapRef.current) {
      initializeMap()
    }
  }, [userLocation, showUserLocationOnStart])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs z-10">
        <h4 className="font-semibold mb-2">Property Types</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Commercial Rent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Commercial Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Rental Property</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>For Sale</span>
          </div>
        </div>

        {/* User Location Legend */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
            <span>Your Location</span>
          </div>
          {userLocation?.accuracy && userLocation.accuracy < 500 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full border border-red-500 border-dashed"></div>
              <span>Accuracy Range</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
