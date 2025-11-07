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

interface Property {
  id: number | string
  imageUrl?: string
  images?: string[]
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
  floorNumber?: string
  totalFloors?: string
  facing?: string
  youtubeLink?: string
  tourLink?: string
  whatsapp?: string
  phone?: string
  contactPhone?: string
  contactPersonName?: string
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

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch('/api/properties')
        const properties = await response.json()
        console.log('All properties from API:', properties.map((p: any) => ({ 
          id: p.id, 
          title: p.title, 
          lat: p.lat, 
          lng: p.lng 
        })))
        const foundProperty = properties.find((p: Property) => p.id.toString() === propertyId)
        console.log('Found property for ID', propertyId, ':', foundProperty)
        setProperty(foundProperty || null)
      } catch (error) {
        console.error('Error fetching property:', error)
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
        const res = await fetch('/api/properties')
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
    const defaultLat = property.lat || 12.9716
    const defaultLng = property.lng || 77.5946

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
    const images: string[] = []
    
    // Prioritize the images array if it exists and has content
    if (property.images && property.images.length > 0) {
      // Use the images array directly (it should contain all images including the main one)
      images.push(...property.images)
    } else if (property.imageUrl) {
      // Fallback to main image if no images array
      images.push(property.imageUrl)
    }
    
    // Remove duplicates by converting to Set and back to array
    const uniqueImages = Array.from(new Set(images))
    
    // If no images, use a default placeholder
    if (uniqueImages.length === 0) {
      uniqueImages.push("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop")
    }
    
    // Return maximum 2 images
    return uniqueImages.slice(0, 2)
  }

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
                const lat = property?.lat || 12.9716
                const lng = property?.lng || 77.5946
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
