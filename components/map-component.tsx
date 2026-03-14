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
  const [mapReady, setMapReady] = useState(false)

  // ================= MAP LOAD =================
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    let destroyed = false

    const load = async () => {
      // CSS
      if (!document.getElementById("leaflet-css")) {
        const css = document.createElement("link")
        css.id = "leaflet-css"
        css.rel = "stylesheet"
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(css)
      }

      if (!document.getElementById("cluster-css")) {
        const css = document.createElement("link")
        css.id = "cluster-css"
        css.rel = "stylesheet"
        css.href =
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        document.head.appendChild(css)
      }

      // JS
      if (!window.L) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script")
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          s.onload = () => resolve()
          document.body.appendChild(s)
        })
      }

      if (!(window.L as any).markerClusterGroup) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script")
          s.src =
            "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
          s.onload = () => resolve()
          document.body.appendChild(s)
        })
      }

      if (destroyed) return

      const L = window.L

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
      }).setView([30.3753, 69.3451], 6)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      const cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
      })

      map.addLayer(cluster)

      mapRef.current = map
      clusterRef.current = cluster

      setTimeout(() => {
        map.invalidateSize()
        setMapReady(true)
      }, 300)
    }

    load()

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        clusterRef.current = null
        setMapReady(false)
      }
    }
  }, [])

  // ================= CITY ZOOM =================
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedCity) return
    mapRef.current.setView([selectedCity.lat, selectedCity.lng], 12)
  }, [selectedCity, mapReady])

  // ================= COORD EXTRACT =================
  const extractCoordinates = (property: any) => {
    let lat
    let lng

    if (Array.isArray(property?.location?.coordinates)) {
      lng = Number(property.location.coordinates[0])
      lat = Number(property.location.coordinates[1])
    } else if (
      Array.isArray(property?.location?.coordinates?.values)
    ) {
      lng = Number(property.location.coordinates.values[0])
      lat = Number(property.location.coordinates.values[1])
    } else if (
      typeof property?.location?.x === "number" &&
      typeof property?.location?.y === "number"
    ) {
      lng = property.location.x
      lat = property.location.y
    } else if (
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
    )
      return null

    return { lat, lng }
  }

  // ================= MARKERS =================
  useEffect(() => {
    if (!mapReady || !clusterRef.current || !mapRef.current || !window.L)
      return

    const L = window.L
    const cluster = clusterRef.current
    const map = mapRef.current

    cluster.clearLayers()

    const filtered =
      filter === "all"
        ? properties
        : properties.filter((p) => p.youAreHereTo === filter)

    const bounds = L.latLngBounds([])

    filtered.forEach((property) => {
      const coords = extractCoordinates(property)
      if (!coords) return

      const color =
        property.youAreHereTo === "sell" ? "#ef4444" : "#16a34a"

      const icon = L.divIcon({
        html: `<div style="
            background:${color};
            width:24px;
            height:24px;
            border-radius:50%;
            border:3px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([coords.lat, coords.lng], {
        icon,
      })

      cluster.addLayer(marker)
      bounds.extend([coords.lat, coords.lng])
    })

    if (bounds.isValid() && !selectedCity) {
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [properties, filter, selectedCity, mapReady])

  return (
    <div className="relative w-full h-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col shadow-lg rounded-lg overflow-hidden">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          All
        </button>

        <button
  onClick={() => setFilter("sell")}
  className="px-4 py-2 text-sm bg-red-500 text-white"
>
  Sell
</button>

          <button
            style={{ backgroundColor: "green" }}
            onClick={() => setFilter("rent")}
            className={`px-4 py-2 text-sm text-white ${
              filter === "rent"
                ? "bg-green-600"
                : "bg-white"
            }`}
          >
            Rent
          </button>
      </div>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}