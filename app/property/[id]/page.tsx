"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import PropertyDetailWidget from '@/components/PropertyDetailWidget'
import NearestPropertiesList from '@/components/NearestPropertiesList'
import { calculateDistance } from '@/utils/locationUtils'
import LocalCompsMap from '@/components/LocalCompsMap'
const API_BASE = process.env.NEXT_PUBLIC_API_URL
interface Property {
  id: number | string
  imageUrl?: string
  uploadedImages?: string[]
  title: string
  beds?: number
  baths?: number
  area?: string
  sqft?: number
  address?: string
  type: string
  price: string
  city?: string
  locality?: string
  propertyCategory?: string
  lat?: number
  lng?: number

  Location?: {
    type: "Point"
    coordinates: [number, number] // [lng, lat]
  }

  floorNumber?: string
  totalFloors?: string
  facing?: string
  youtubeLink?: string
  tourLink?: string
  whatsapp?: string
  phone?: string
  contactPhone?: string
  contactPersonName?: string
  youAreHereTo?: string
}


export const getPropertyLatLng = (property: any) => {
  const c = property?.location?.coordinates

  if (!c) return null

  // CASE 1: your current backend format (x/y object)
  if (typeof c?.x === "number" && typeof c?.y === "number") {
    return {
      lat: c.x,
      lng: c.y,
    }
  }

  // CASE 2: values array (also present in your payload)
  if (Array.isArray(c?.values)) {
    return {
      lat: Number(c.values[0]),
      lng: Number(c.values[1]),
    }
  }

  // CASE 3: standard GeoJSON fallback
  if (Array.isArray(c)) {
    return {
      lng: Number(c[0]),
      lat: Number(c[1]),
    }
  }

  return null
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const propertyId = params.id
  const [property, setProperty] = useState<Property | null>(null)
  const [nearestProperties, setNearestProperties] = useState<Property[]>([])
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const satelliteMapRef = useRef<any>(null)
  const locationMapRef = useRef<any>(null)
  const leafletLoaded = useRef(false)

  const propertyIdStr = Array.isArray(propertyId)
  ? propertyId[0]
  : propertyId

  useEffect(() => {
  const fetchProperty = async () => {
  try {
    const res = await fetch(`${API_BASE}/properties/GetAllProperties?page=1&pageSize=50`, {
      cache: "no-store"
    })

    const list = await res.json()
    const selected = list.find(
      (p:any)=> String(p.id) === String(propertyIdStr)
    )
    if (!selected) {
      setProperty(null)
      return
    }
const normalizedProperty = {
  
  id: selected.id,
  title: selected.title,
  beds: selected.bedrooms ? Number(selected.bedrooms) : undefined,
  baths: selected.bathrooms ? Number(selected.bathrooms) : undefined,
  area:
    selected.area && selected.areaUnit
      ? `${selected.area} ${selected.areaUnit}`
      : undefined,
  address: selected.fullAddress,
  price: selected.price
    ? `₹ ${Number(selected.price).toLocaleString()} / ${selected.priceUnit}`
    : "",
  city: selected.city,
  locality: selected.locality,
  facing: selected.facing,
  floorNumber: selected.floorNumber,
  totalFloors: selected.totalFloors,

  // 👇 keep original purpose
  youAreHereTo: selected.youAreHereTo,

  // 👇 normalized display type
  type:
    selected.youAreHereTo?.toLowerCase() === "rent"
      ? "RENT"
      : selected.youAreHereTo?.toLowerCase() === "sell" || selected.youAreHereTo?.toLowerCase() === "sale"
      ? "SALE"
      : "UNKNOWN",

  propertyCategory: selected.propertyCategory,
  whatsapp: selected.whatsapp,
  contactPersonName: selected.contactPersonName,
  uploadedImages: selected.uploadedImages || [],
  lat: getPropertyLatLng(selected)?.lat,
  lng: getPropertyLatLng(selected)?.lng
};
console.log("Extracting lat/lng from property:", {
Location: selected.Location,
})
setProperty(normalizedProperty);

      } catch (err) {
        console.error("❌ FETCH ERROR =", err)
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  useEffect(() => {
    if (!property) return

    const fetchAndComputeNearest = async () => {
      try {
        const res = await fetch(`${API_BASE}/properties`, {
  cache: "no-store"
})
        const allProperties = await res.json()

        if (typeof property.lat !== 'number' || typeof property.lng !== 'number') {
          setNearestProperties([])
          return
        }

        const withDist = allProperties
          .filter((p: Property) => p && p.lat !== undefined && p.lng !== undefined && p.id !== property.id)
          .map((p: Property) => ({
            ...p,
            dist: calculateDistance(property.lat!, property.lng!, Number(p.lat), Number(p.lng)),
          }))

        withDist.sort((a: any, b: any) => a.dist - b.dist)
        const nearest = withDist.slice(0, 8)
        setNearestProperties(nearest)
      } catch (err) {
        console.error('Failed to fetch properties for nearest list', err)
        setNearestProperties([])
      }
    }

    fetchAndComputeNearest()
  }, [property])

  // Load Leaflet and initialize maps
  useEffect(() => {
    if (leafletLoaded.current) return

    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        leafletLoaded.current = true
      } catch (error) {
        console.error('Error loading Leaflet:', error)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize maps when property data is loaded and Leaflet is available
  useEffect(() => {
    if (!property || !leafletLoaded.current || !window.L) return

    // Use actual property coordinates if available, otherwise use default Bangalore coordinates
   const defaultLat = property.lat 

const defaultLng = property.lng

    // Initialize Satellite Map (left side)
    const satelliteContainer = document.getElementById('satellite-map')
    if (satelliteContainer && !satelliteMapRef.current) {
      const satelliteMap = window.L.map('satellite-map', { 
        attributionControl: false,
        zoomControl: true // Enable zoom control
      }).setView([defaultLat, defaultLng], 16)
      
      // Position zoom control to bottom right to avoid button overlap
      satelliteMap.zoomControl.setPosition('bottomright')
      
      window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      }).addTo(satelliteMap)

      window.L.marker([defaultLat, defaultLng]).addTo(satelliteMap)
      
      satelliteMapRef.current = satelliteMap
    }

    // Initialize Location Map (right side)
    const locationContainer = document.getElementById('location-map')
    if (locationContainer && !locationMapRef.current) {
      const locationMap = window.L.map('location-map', { 
        attributionControl: false,
        zoomControl: true // Enable zoom control
      }).setView([defaultLat, defaultLng], 14)
      
      // Position zoom control to bottom left to avoid button overlap
      locationMap.zoomControl.setPosition('bottomleft')
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(locationMap)

      window.L.marker([defaultLat, defaultLng]).addTo(locationMap)
      
      locationMapRef.current = locationMap
    }

    // Cleanup function
    return () => {
      if (satelliteMapRef.current) {
        satelliteMapRef.current.remove()
        satelliteMapRef.current = null
      }
      if (locationMapRef.current) {
        locationMapRef.current.remove()
        locationMapRef.current = null
      }
    }
  }, [property, leafletLoaded.current])

  const getPropertyTypeLabel = (type: string) => {
    if (type === 'rental') return 'House for rent'
    if (type.includes('sale-residential')) return 'House for sale'
    if (type.includes('sale-commercial')) return 'Commercial for sale'
    if (type.includes('sale-farmland')) return 'Land for sale'
    if (type.includes('sale')) return 'Property for sale'
    return 'House for sale'
  }

  const getPropertyTypeColor = (type: string) => {
    // Always return white background for the badge
    return 'bg-white'
  }

  const getDotColor = (type: string) => {
    if (type === 'rental') return 'bg-blue-600'
    return 'bg-red-600'
  }

const getPropertyImages = (property: Property) => {
  const images: string[] = [];

  if (property.uploadedImages?.length) {
    images.push(...property.uploadedImages);
  } else if (property.imageUrl) {
    images.push(property.imageUrl);
  }

  const normalizedImages = images
    .filter(Boolean)
    .map((img) => {
      const value = String(img).trim();

      // Raw Base64 JPEG
      if (value.startsWith("/9j/")) {
        return `data:image/jpeg;base64,${value}`;
      }

      // Raw Base64 PNG
      if (value.startsWith("iVBOR")) {
        return `data:image/png;base64,${value}`;
      }

      // Already a data URL
      if (value.startsWith("data:image")) {
        return value;
      }

      // Absolute URL
      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        return value;
      }

      // Relative URL
      if (value.startsWith("/")) {
        return value;
      }

      return `/${value}`;
    });

  const uniqueImages = [...new Set(normalizedImages)];

  if (uniqueImages.length === 0) {
    uniqueImages.push(
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop"
    );
  }
  return uniqueImages.slice(0, 2);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b px-4 py-3 flex items-center">
          <Link href="/">
            <button className="mr-3 mt-2 bg-transparent border-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-xl text-black">Property Not Found</h1>
        </div>
        <div className="p-4 text-center">
          <p className="text-gray-600">Property not found</p>
        </div>
      </div>
    )
  }

  const propertyImages = getPropertyImages(property)
  const showTwoImages = propertyImages.length >= 2

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <Link href="/">
          <button className="mr-3 mt-2 bg-transparent border-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl text-black">Property Details</h1>
      </div>

      {/* Property Images Section */}
      <div className="relative">
        {showTwoImages ? (
          <div className="flex flex-col gap-0">
            {/* First Image with Overlay */}
            <div className="relative aspect-[16/9]">
              <Image
                src={propertyImages[0]}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />
              {/* Property Type Overlay */}
              <div className="absolute bottom-4 left-4">
                <div className={`${getPropertyTypeColor(property.type)} text-gray-900 px-3 py-1 rounded-md flex items-center gap-2 shadow-md`}>
                  <div className={`w-2 h-2 ${getDotColor(property.type)} rounded-full`}></div>
                  <span className="text-sm font-medium">{getPropertyTypeLabel(property.type)}</span>
                </div>
              </div>
            </div>
            {/* Second Image */}
            <div className="relative aspect-[16/9]">
              <Image
                src={propertyImages[1]}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          /* Single Image */
          <div className="relative aspect-[16/9]">
            <Image
              src={propertyImages[0]}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            {/* Property Type Overlay */}
            <div className="absolute bottom-4 left-4">
              <div className={`${getPropertyTypeColor(property.type)} text-gray-900 px-3 py-1 rounded-md flex items-center gap-2 shadow-md`}>
                <div className={`w-2 h-2 ${getDotColor(property.type)} rounded-full`}></div>
                <span className="text-sm font-medium">{getPropertyTypeLabel(property.type)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Street View and Map Section */}
      <div className="grid grid-cols-2 gap-0">
        {/* Satellite View - Left Side */}
        <div className="relative aspect-[16/9] bg-gray-100">
          <div 
            id="satellite-map" 
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Look Around Button - top left */}
          <div className="absolute top-4 left-4 z-[1000]">
            <button
              onClick={() => {
                const lat = property?.lat 
                const lng = property?.lng 
                const streetViewUrl = `https://www.google.com/maps/@${lat},${lng},3a,75y,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i13312!8i6656`
                window.open(streetViewUrl, '_blank')
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-600"
            >
              <img src="/kind.png" alt="Look Around" width={20} height={20} />
              Look Around
            </button>
          </div>

          {/* Look Inside Button - top right */}
          <div className="absolute top-4 right-4 z-[1000]">
            <button
              onClick={() => {
                const youtubeLink = (property as any)?.youtubeLink
                const tourLink = (property as any)?.tourLink
                if (youtubeLink) {
                  window.open(youtubeLink, '_blank')
                } else if (tourLink) {
                  window.open(tourLink, '_blank')
                } else {
                  console.log('No YouTube or tour link available for this property')
                }
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors text-sm font-medium border ${
                (property as any)?.youtubeLink || (property as any)?.tourLink
                  ? 'bg-gray-800 text-white hover:bg-gray-700 cursor-pointer border-gray-600'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-300'
              }`}
              disabled={!((property as any)?.youtubeLink || (property as any)?.tourLink)}
            >
              <img src="/kind.png" alt="Look Inside" width={20} height={20} />
              Look Inside
            </button>
          </div>
        </div>
        
        {/* Location Map - Right Side */}
        <div className="relative aspect-[16/9] bg-gray-100">
          <div 
            id="location-map" 
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>

  {/* Property Details Content (now using reusable widget) */}
      
  <PropertyDetailWidget property={property as any} />

  {/* Local Comps Map */}
  {property && nearestProperties.length > 0 && (
    <LocalCompsMap 
      centerProperty={property} 
      properties={nearestProperties} 
      onVisiblePropertiesChange={(visibleProperties: any) => setVisibleProperties(visibleProperties as any)}
    />
  )}

  {/* Nearest properties list (5-10 nearest) */}
  <NearestPropertiesList items={visibleProperties} />

    </div>
  )
}
