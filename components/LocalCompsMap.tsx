"use client"

import React, { useEffect, useRef } from "react"

type Property = {
  id?: number | string
  _id?: number | string
  propertyId?: number | string

  lat?: number | string
  lng?: number | string

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
  onVisiblePropertiesChange?: (visible: Property[]) => void
}

declare global {
  interface Window {
    L: any
  }
}

const LocalCompsMap: React.FC<Props> = ({
  centerProperty,
  properties,
  onVisiblePropertiesChange,
}) => {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const leafletLoaded = useRef(false)

  /* ================= LOAD LEAFLET ================= */

  useEffect(() => {
    const loadLeaflet = async () => {
      if (leafletLoaded.current) return

      if (!window.L) {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        await new Promise<void>((resolve) => {
          const script = document.createElement("script")
          script.src =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      leafletLoaded.current = true
      initMap()
    }

    loadLeaflet()
  }, [])

  /* ================= FILTER CITY ================= */

  const filterCityProperties = () => {
    const centerLat = Number(centerProperty.lat)
    const centerLng = Number(centerProperty.lng)

    if (!centerLat || !centerLng) return []

    const radius = 0.15

    const north = centerLat + radius
    const south = centerLat - radius
    const east = centerLng + radius
    const west = centerLng - radius

    const centerId =
      centerProperty.id ||
      centerProperty._id ||
      centerProperty.propertyId

    return properties.filter((p) => {
      const lat = Number(p.lat)
      const lng = Number(p.lng)

      if (!lat || !lng) return false

      const pid = p.id || p._id || p.propertyId

      if (String(pid) === String(centerId)) return false

      return (
        lat >= south &&
        lat <= north &&
        lng >= west &&
        lng <= east &&
        (!centerProperty.city ||
          p.city === centerProperty.city)
      )
    })
  }

  /* ================= INIT MAP ================= */

  const initMap = () => {
    if (!containerRef.current || !window.L) return

    const centerLat = Number(centerProperty.lat)
    const centerLng = Number(centerProperty.lng)

    if (!centerLat || !centerLng) return

    mapRef.current?.remove()

    const L = window.L

    const cityProperties = filterCityProperties()

    onVisiblePropertiesChange?.(cityProperties)

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([centerLat, centerLng], 14)

    mapRef.current = map

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map)

    const createIcon = (color: string) =>
      L.divIcon({
        html: `<div style="background:${color};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white"></div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })

    L.marker([centerLat, centerLng], {
      icon: createIcon("#3B82F6"),
    }).addTo(map)

    if (cityProperties.length) {
      const bounds = L.latLngBounds([
        centerLat,
        centerLng,
      ])

      cityProperties.forEach((p) => {
        const lat = Number(p.lat)
        const lng = Number(p.lng)

        if (!lat || !lng) return

        L.marker([lat, lng], {
          icon: createIcon("#10B981"),
        }).addTo(map)

        bounds.extend([lat, lng])
      })

      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 15,
      })
    }
  }

  /* ================= REINIT ================= */

  useEffect(() => {
    if (leafletLoaded.current) {
      initMap()
    }

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [centerProperty, properties])

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium mb-3">
        Local Comps
      </h3>
      <div
        ref={containerRef}
        className="w-full h-96 rounded-lg"
      />
    </div>
  )
}

export default LocalCompsMap