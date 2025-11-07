"use client"

import React, { useEffect, useRef } from 'react'

interface Property {
  id: number | string
  lat?: number
  lng?: number
  type?: string
  city?: string
  title?: string
  price?: string
  address?: string
  beds?: number
  baths?: number
  area?: string
  sqft?: number
  floorNumber?: string
  totalFloors?: string
  facing?: string
  locality?: string
  imageUrl?: string
}

interface Props {
  centerProperty: Property
  properties: Property[]
  onVisiblePropertiesChange?: (visibleProperties: Property[]) => void
}

declare global {
  interface Window {
    L: any
  }
}

const LocalCompsMap: React.FC<Props> = ({ centerProperty, properties, onVisiblePropertiesChange }) => {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const leafletLoaded = useRef(false)

  useEffect(() => {
    const loadLeaflet = async () => {
      if (leafletLoaded.current) return
      if (!window.L) {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }
        await new Promise<void>((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = () => resolve()
          document.head.appendChild(script)
        })
      }
      leafletLoaded.current = true
      initializeMap()
    }
    loadLeaflet()
  }, [])

  // Calculate city bounds based on center property
  const getCityBounds = (centerLat: number, centerLng: number) => {
    // Create a reasonable city boundary (approximately 15-20km radius)
    const cityRadius = 0.15 // approximately 15-20km in degrees
    return {
      north: centerLat + cityRadius,
      south: centerLat - cityRadius,
      east: centerLng + cityRadius,
      west: centerLng - cityRadius
    }
  }

  // Filter properties that are within the city bounds
  const filterPropertiesInCity = (centerProperty: Property, allProperties: Property[]) => {
    if (!centerProperty.lat || !centerProperty.lng) return []
    
    const bounds = getCityBounds(centerProperty.lat, centerProperty.lng)
    
    return allProperties.filter(property => {
      if (!property.lat || !property.lng || property.id === centerProperty.id) return false
      
      return (
        property.lat >= bounds.south &&
        property.lat <= bounds.north &&
        property.lng >= bounds.west &&
        property.lng <= bounds.east &&
        property.city === centerProperty.city // Also filter by city name if available
      )
    })
  }

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L || mapRef.current || !centerProperty.lat || !centerProperty.lng) {
      return
    }

    const L = window.L
    
    // Filter properties to only show those in the same city
    const cityProperties = filterPropertiesInCity(centerProperty, properties)
    
    // Notify parent component about visible properties
    if (onVisiblePropertiesChange) {
      onVisiblePropertiesChange(cityProperties)
    }

    // Create map with higher zoom level to focus on city area
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([centerProperty.lat, centerProperty.lng], 14) // Increased zoom from 12 to 14

    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    const createIcon = (color: string) => L.divIcon({
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center;"><div style="width: 12px; height: 12px; background-image: url('/icons/home.svg'); background-size: contain; transform: rotate(45deg);"></div></div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    // Add marker for the center property (blue)
    L.marker([centerProperty.lat, centerProperty.lng], { icon: createIcon('#3B82F6') }).addTo(map)

    // Add markers only for properties in the same city (green)
    if (cityProperties.length > 0) {
      const bounds = L.latLngBounds([centerProperty.lat, centerProperty.lng])
      
      cityProperties.forEach(p => {
        if (p.lat && p.lng) {
          L.marker([p.lat, p.lng], { icon: createIcon('#10B981') }).addTo(map)
          bounds.extend([p.lat, p.lng])
        }
      })

      // Fit map to bounds with more padding to keep focus on city area
      map.fitBounds(bounds, { 
        padding: [30, 30],
        maxZoom: 15 // Limit max zoom to keep city-level view
      })
    } else {
      // If no nearby properties, just set a reasonable city-level zoom
      map.setZoom(14)
    }
  }

  useEffect(() => {
    if (leafletLoaded.current) {
      initializeMap()
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [centerProperty, properties])

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Local Comps</h3>
      <div ref={mapContainerRef} className="w-full h-96 rounded-lg" />
    </div>
  )
}

export default LocalCompsMap
