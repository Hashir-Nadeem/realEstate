"use client"

import { useEffect, useRef } from "react"

interface MapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void
  userLocation?: { lat: number; lng: number; accuracy?: number } | null
} 
  
declare global {
  interface Window {
    L: any
  }
} 
 

export default function MapSelector({ onLocationSelect, userLocation }: MapSelectorProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const accuracyCircleRef = useRef<any>(null)
  const leafletLoaded = useRef(false)

  const getOptimalZoom = (accuracy?: number) => {
    if (!accuracy) return 16 // Default high zoom for property posting

    // Higher zoom levels for property posting - need precision
    if (accuracy > 200) return 14 // Fair accuracy - neighborhood level
    if (accuracy > 100) return 15 // Good accuracy - street level
    if (accuracy > 50) return 16 // Very good accuracy - building level
    return 17 // Excellent accuracy - precise building level
  }

  useEffect(() => {
    if (leafletLoaded.current) {
      initializeMap()
      return
    }

    const loadLeaflet = async () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        leafletLoaded.current = true
        initializeMap()
        return
      }

      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const cssLink = document.createElement("link")
        cssLink.rel = "stylesheet"
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(cssLink)
      }

      // Load JS
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          leafletLoaded.current = true
          initializeMap()
        }
        document.head.appendChild(script)
      }
    }

    loadLeaflet()
  }, [])

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L || mapRef.current) return

    const L = window.L

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    })

    mapRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

    // Set initial view to user location or default
    const initialLocation = userLocation || { lat: 12.9716, lng: 77.5946 }
    const initialZoom = getOptimalZoom(userLocation?.accuracy)
    map.setView([initialLocation.lat, initialLocation.lng], initialZoom)

    // Add user location marker if available
    if (userLocation) {
      addUserLocationMarker(userLocation)
      // Auto-select user location
      onLocationSelect({ lat: userLocation.lat, lng: userLocation.lng })
    }

    // Add click handler
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng

      // Remove existing property marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Create custom pin icon for property location
      const pinIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background-color: #EF4444; 
              width: 28px; 
              height: 28px; 
              border-radius: 50% 50% 50% 0; 
              transform: rotate(-45deg);
              border: 3px solid white; 
              box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            "></div>
            <div style="
              position: absolute;
              top: 8px;
              left: 8px;
              width: 10px;
              height: 10px;
              background-color: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        className: "custom-pin-marker",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      // Add new property marker with pin icon
      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
      marker.bindPopup(`
        <div class="p-2 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <span class="font-semibold text-sm">Property Location</span>
          </div>
          <p class="text-xs text-gray-600">
            ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </p>
        </div>
      `)
      markerRef.current = marker

      // Call callback
      onLocationSelect({ lat, lng })
    })
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
    if (location.accuracy && location.accuracy < 300) {
      const accuracyCircle = L.circle([location.lat, location.lng], {
        radius: location.accuracy,
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.1,
        weight: 2,
        dashArray: "3, 3",
      }).addTo(map)
      accuracyCircleRef.current = accuracyCircle
    }

    // Add user location marker
    const userIcon = L.divIcon({
      html: `
      <div style="position: relative;">
        <div style="
          background-color: #3B82F6; 
          width: 20px; 
          height: 20px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
      className: "user-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const userMarker = L.marker([location.lat, location.lng], {
      icon: userIcon,
      zIndexOffset: 500,
    }).addTo(map)

    const accuracyText = location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ""
    userMarker.bindPopup(`
    <div class="p-2 text-center">
      <div class="flex items-center justify-center gap-2 mb-1">
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="font-semibold text-sm">Your Current Location</span>
      </div>
      <p class="text-xs text-gray-600 mb-1">
        ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
      </p>
      ${accuracyText ? `<p class="text-xs text-gray-500">Accuracy: ${accuracyText}</p>` : ""}
      <p class="text-xs text-blue-600 mt-1">Click on map to set property location</p>
    </div>
  `)

    userMarkerRef.current = userMarker

    // Auto-place property marker at user location initially
    const propertyIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background-color: #EF4444; 
            width: 28px; 
            height: 28px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            border: 3px solid white; 
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          "></div>
          <div style="
            position: absolute;
            top: 8px;
            left: 8px;
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: "custom-pin-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })

    const propertyMarker = L.marker([location.lat, location.lng], {
      icon: propertyIcon,
      zIndexOffset: 1000,
    }).addTo(map)

    propertyMarker.bindPopup(`
      <div class="p-2 text-center">
        <div class="flex items-center justify-center gap-2 mb-1">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <span class="font-semibold text-sm">Property Location</span>
        </div>
        <p class="text-xs text-gray-600 mb-1">
          ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
        </p>
        <p class="text-xs text-green-600">Auto-set to your location</p>
      </div>
    `)

    markerRef.current = propertyMarker
  }

  // Update map when user location changes
  useEffect(() => {
    if (leafletLoaded.current && userLocation && mapRef.current) {
      const map = mapRef.current
      const zoom = getOptimalZoom(userLocation.accuracy)
      map.setView([userLocation.lat, userLocation.lng], zoom)
      addUserLocationMarker(userLocation)
    }
  }, [userLocation])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-48 rounded-lg border" />
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs shadow">
        Click on map to set exact property location
      </div>
    </div>
  )
}
