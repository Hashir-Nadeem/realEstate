"use client"

import { useEffect, useRef, useState } from "react"

interface MapProps {
  properties: any[]
  selectedCity?: {
    name: string
    lat: number
    lng: number
  } | null
}

declare global {
  interface Window {
    L: any
  }
}

export default function MapComponent({
  properties,
  selectedCity,
}: MapProps) {
  const mapRef = useRef<any>(null)
  const clusterRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<"all" | "sell" | "rent">("all")

  // ==========================================
  // LOAD LEAFLET + INIT MAP (ONLY ONCE)
  // ==========================================
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const loadMap = async () => {
      // Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const css = document.createElement("link")
        css.id = "leaflet-css"
        css.rel = "stylesheet"
        css.href =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(css)
      }

      // MarkerCluster CSS
      if (!document.getElementById("cluster-css")) {
        const css = document.createElement("link")
        css.id = "cluster-css"
        css.rel = "stylesheet"
        css.href =
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        document.head.appendChild(css)
      }

      // Leaflet JS
      if (!window.L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script")
          script.src =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      // MarkerCluster JS
      if (!(window.L as any).markerClusterGroup) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script")
          script.src =
            "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      const L = window.L

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
      }).setView([20.5937, 78.9629], 5)

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }
      ).addTo(map)

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        iconCreateFunction: function (cluster: any) {
          const count = cluster.getChildCount()
          const size = count < 10 ? 40 : count < 50 ? 50 : 60

          return L.divIcon({
            html: `
              <div style="
                width:${size}px;
                height:${size}px;
                border-radius:50%;
                background: radial-gradient(circle at 30% 30%, #60a5fa, #2563eb);
                display:flex;
                align-items:center;
                justify-content:center;
                color:white;
                font-weight:700;
                border:4px solid white;
                box-shadow:0 4px 10px rgba(0,0,0,0.25);
              ">
                ${count}
              </div>
            `,
            className: "",
            iconSize: [size, size],
          })
        },
      })

      map.addLayer(clusterGroup)

      mapRef.current = map
      clusterRef.current = clusterGroup

      setTimeout(() => {
        map.invalidateSize()
      }, 300)
    }

    loadMap()
  }, [])

  // ==========================================
  // ZOOM TO SELECTED CITY
  // ==========================================
  useEffect(() => {
    if (!mapRef.current || !selectedCity) return
    mapRef.current.setView(
      [selectedCity.lat, selectedCity.lng],
      12
    )
  }, [selectedCity])

  // ==========================================
  // UNIVERSAL COORDINATE EXTRACTOR
  // ==========================================
  const extractCoordinates = (property: any) => {
    let lat: number | undefined
    let lng: number | undefined

    // Case 1: GeoJSON array
    if (Array.isArray(property?.location?.coordinates)) {
      lng = Number(property.location.coordinates[0])
      lat = Number(property.location.coordinates[1])
    }

    // Case 2: coordinates.values
    else if (
      Array.isArray(property?.location?.coordinates?.values)
    ) {
      lng = Number(property.location.coordinates.values[0])
      lat = Number(property.location.coordinates.values[1])
    }

    // Case 3: location.x / location.y
    else if (
      typeof property?.location?.x === "number" &&
      typeof property?.location?.y === "number"
    ) {
      lng = property.location.x
      lat = property.location.y
    }

    // Case 4: flat latitude / longitude
    else if (
      typeof property?.latitude === "number" &&
      typeof property?.longitude === "number"
    ) {
      lat = property.latitude
      lng = property.longitude
    }

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return null
    }

    return { lat, lng }
  }

  // ==========================================
  // UPDATE MARKERS SAFELY
  // ==========================================
useEffect(() => {
  const L = window.L

  if (
    !clusterRef.current ||
    !mapRef.current ||
    !L ||
    !clusterRef.current._map   // ⭐ CRITICAL FIX
  )
    return

  const clusterGroup = clusterRef.current
  const map = mapRef.current

  clusterGroup.clearLayers()

  const filtered =
    filter === "all"
      ? properties
      : properties.filter(
          (p) => p.youAreHereTo === filter
        )

  const bounds = L.latLngBounds([])

  filtered.forEach((property) => {
    const coords = extractCoordinates(property)
    if (!coords) return

    const color =
      property.youAreHereTo === "sell"
        ? "#ef4444"
        : "#16a34a"

    const pinIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background:${color};
            width:28px;
            height:28px;
            border-radius:50% 50% 50% 0;
            transform: rotate(-45deg);
            border:3px solid white;
            box-shadow:0 4px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position:absolute;
            top:8px;
            left:8px;
            width:12px;
            height:12px;
            background:white;
            border-radius:50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    })

    const marker = L.marker([coords.lat, coords.lng], {
      icon: pinIcon,
    })

    clusterGroup.addLayer(marker)
    bounds.extend([coords.lat, coords.lng])
  })

  if (bounds.isValid() && !selectedCity) {
    map.fitBounds(bounds, { padding: [60, 60] })
  }
}, [properties, filter, selectedCity])
  return (
    <div className="relative w-full h-full">

      {/* LEFT FILTER */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col shadow-lg rounded-lg overflow-hidden">

        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("sell")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "sell"
              ? "bg-red-500 text-white"
              : "bg-white"
          }`}
        >
          Sell
        </button>

        <button
          onClick={() => setFilter("rent")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "rent"
              ? "bg-green-600 text-white"
              : "bg-white"
          }`}
        >
          Rent
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />
    </div>
  )
}