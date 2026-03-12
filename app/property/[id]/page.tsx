"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState, useRef } from "react"

import PropertyDetailWidget from "@/components/PropertyDetailWidget"
import NearestPropertiesList from "@/components/NearestPropertiesList"
import LocalCompsMap from "@/components/LocalCompsMap"
import { calculateDistance } from "@/utils/locationUtils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL!

interface Property {
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
  uploadedImages?: string[]
}

export default function PropertyDetailsPage() {
   // ✅ MOVE HOOK HERE
  const [leafletReady, setLeafletReady] = useState(false)
  const params = useParams()
  const propertyId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id

  const [property, setProperty] = useState<Property | null>(null)
  const [nearestProperties, setNearestProperties] = useState<Property[]>([])
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const satelliteMapRef = useRef<any>(null)
  const locationMapRef = useRef<any>(null)
  const leafletLoaded = useRef(false)

  /* ================= FETCH SINGLE PROPERTY ================= */

  useEffect(() => {
    if (!propertyId) return

    const load = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${API_BASE}/properties/${propertyId}`
        )

        if (!res.ok) {
          setProperty(null)
          return
        }

        const data = await res.json()

        const found =
          data?.data ||
          data?.item ||
          data

        if (!found) {
          setProperty(null)
          return
        }

        const normalized = {
          ...found,
          id:
            found.id ||
            found._id ||
            found.propertyId,
        }

        setProperty(normalized)

        /* ===== FETCH NEAREST PROPERTIES ===== */

        const lat = Number(normalized.lat)
        const lng = Number(normalized.lng)

        if (!lat || !lng) return

        const listRes = await fetch(
          `${API_BASE}/properties?page=1&pageSize=100`
        )

        const listJson = await listRes.json()

        let raw: any[] = []

        if (Array.isArray(listJson)) raw = listJson
        else if (listJson.items) raw = listJson.items
        else if (listJson.data) raw = listJson.data

        const nearest = raw
          .filter((p: any) => {
            const pid =
              p.id || p._id || p.propertyId
            return (
              String(pid) !== String(propertyId) &&
              p.lat &&
              p.lng
            )
          })
          .map((p: any) => ({
            ...p,
            id:
              p.id ||
              p._id ||
              p.propertyId,
            dist: calculateDistance(
              lat,
              lng,
              Number(p.lat),
              Number(p.lng)
            ),
          }))
          .sort((a: any, b: any) => a.dist - b.dist)
          .slice(0, 10)

        setNearestProperties(nearest)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [propertyId])

  /* ================= LOAD LEAFLET ================= */

 useEffect(() => {
  const loadLeaflet = async () => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    if (!(window as any).L) {
      await new Promise((resolve) => {
        const script = document.createElement("script")
        script.src =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = resolve
        document.body.appendChild(script)
      })
    }

    leafletLoaded.current = true
    setLeafletReady(true)   // ⭐ VERY IMPORTANT
  }

  loadLeaflet()
}, [])
  /* ================= INIT MAP ================= */

  useEffect(() => {
    if (!property) return
    if (!leafletLoaded.current) return
    if (!(window as any).L) return

    const lat = Number(property.lat) || 33.6844
    const lng = Number(property.lng) || 73.0479

    satelliteMapRef.current?.remove()
    locationMapRef.current?.remove()

    const sat = (window as any).L.map("satellite-map", {
      attributionControl: false,
    }).setView([lat, lng], 16)

    ;(window as any).L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    ).addTo(sat)

    ;(window as any).L.marker([lat, lng]).addTo(sat)

    satelliteMapRef.current = sat

    const loc = (window as any).L.map("location-map", {
      attributionControl: false,
    }).setView([lat, lng], 14)

    ;(window as any).L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(loc)

    ;(window as any).L.marker([lat, lng]).addTo(loc)

    locationMapRef.current = loc
  }, [property,])

  /* ================= IMAGES ================= */

 /* ================= IMAGES (DYNAMIC FIX) ================= */

const buildImageUrl = (img?: string) => {
  if (!img) return null

  // already full URL
  if (img.startsWith("http")) return img

  // relative from API
  return `http://localhost:3000${img}`
}

const images =
  property?.uploadedImages?.length
    ? property.uploadedImages
        .map(buildImageUrl)
        .filter(Boolean)
    : property?.imageUrl
    ? [buildImageUrl(property.imageUrl)]
    : []

// fallback if API gives nothing
const displayImages =
  images.length > 0
    ? images
    : [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200",
      ]

  /* ================= UI ================= */

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )

  if (!property)
    return (
      <div className="p-10 text-center">
        Property Not Found
      </div>
    )
return (
  <div className="bg-[#f6f7fb] min-h-screen">

    {/* HEADER */}
    <div className="bg-white border-b sticky top-0 z-40 px-5 py-4 flex items-center shadow-sm">
      <Link href="/" className="mr-3">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <h1 className="text-lg font-semibold">
        Property Details
      </h1>
    </div>

    {/* HERO IMAGES */}
    <div className="max-w-6xl mx-auto mt-4 px-4">
      <div className="grid md:grid-cols-2 gap-2 rounded-2xl overflow-hidden shadow">
        <div className="relative aspect-[16/10]">
          <Image src={displayImages[0] as string}
            alt="property"
            fill
            className="object-cover hover:scale-105 transition duration-500"
            priority
          />
        </div>

        <div className="grid grid-rows-2 gap-2">
          {displayImages.slice(1, 3).map((img, i)  => (
            <div key={i} className="relative">
              <div className="relative aspect-[16/10]">
                <Image src={displayImages[0] as string}
                  alt="property"
                  fill
                  className="object-cover hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* MAP SECTION */}
    <div className="max-w-6xl mx-auto px-4 mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative h-[280px] rounded-2xl overflow-hidden shadow bg-white">
          <div id="satellite-map" className="absolute inset-0" />
        </div>

        <div className="relative h-[280px] rounded-2xl overflow-hidden shadow bg-white">
          <div id="location-map" className="absolute inset-0" />
        </div>
      </div>
    </div>

    {/* DETAILS */}
    <div className="max-w-6xl mx-auto px-4 mt-6">
      <div className="bg-white rounded-2xl shadow p-5">
        <PropertyDetailWidget property={property as any} />
      </div>
    </div>

    {/* NEAREST */}
    {nearestProperties.length > 0 && (
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <LocalCompsMap
            centerProperty={property}
            properties={nearestProperties}
            onVisiblePropertiesChange={(p: any) =>
              setVisibleProperties(p)
            }
          />
        </div>
      </div>
    )}

    <div className="max-w-6xl mx-auto px-4 mt-6 pb-10">
      <NearestPropertiesList items={visibleProperties} />
    </div>

  </div>
)
}