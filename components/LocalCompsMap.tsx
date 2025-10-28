"use client"

import React, { useEffect, useRef } from 'react'

interface Property {
  id: number | string
  lat?: number
  lng?: number
  type?: string
}

interface Props {
  centerProperty: Property
  properties: Property[]
}

declare global {
  interface Window {
    L: any
  }
}

const LocalCompsMap: React.FC<Props> = ({ centerProperty, properties }) => {
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

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L || mapRef.current || !centerProperty.lat || !centerProperty.lng) {
      return
    }

    const L = window.L
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([centerProperty.lat, centerProperty.lng], 12) // Adjusted zoom level to 12

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

    // Add markers for other properties (green)
    const bounds = L.latLngBounds([centerProperty.lat, centerProperty.lng]) // Initialize bounds with center property
    properties.forEach(p => {
      if (p.lat && p.lng && p.id !== centerProperty.id) {
        L.marker([p.lat, p.lng], { icon: createIcon('#10B981') }).addTo(map)
        bounds.extend([p.lat, p.lng]) // Extend bounds to include each property
      }
    })

    // Fit map to bounds to ensure all markers are visible
    map.fitBounds(bounds, { padding: [50, 50] })
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
      <div ref={mapContainerRef} className="w-full h-96 rounded-lg" /> {/* Increased height to h-96 */}
    </div>
  )
}

export default LocalCompsMap
