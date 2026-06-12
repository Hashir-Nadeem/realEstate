"use client"

import { useEffect, useRef, useState } from "react"
import { MapViewTracker } from "./map/MapViewTracker"
import { getOptimalZoom } from "@/utils/mapUtils"
import { useRouter } from "next/navigation"
import { PropertyTypeToggle } from "./ui/PropertyTypeToggle"

interface MapComponentProps {
  selectedCity: { name: string; lat: number; lng: number } | null
  userLocation: { lat: number; lng: number; accuracy?: number } | null
  cities: { name: string; lat: number; lng: number }[]
  recenterTrigger?: { lat: number; lng: number; accuracy?: number } | null
  showUserLocationOnStart?: boolean
  onViewChange?: (isViewingCurrentLocation: boolean) => void
  onZoomChange?: (zoom: number) => void
  zoom?: number
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
  onViewChange,
  onZoomChange,
  zoom = 12,
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const accuracyCircleRef = useRef<any>(null)
  const leafletLoaded = useRef(false)
  const router = useRouter()

  const [showSale, setShowSale] = useState(true) // Default to true (selected)
  const [showRental, setShowRental] = useState(true) // Default to true (selected)

  // dynamic properties fetched from server (built-in + CSV submissions)
  const [properties, setProperties] = useState<any[]>([])
 const fetchProperties = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/GetAllProperties?limit=1000`)
    if (!res.ok) {
      console.warn("❌ Failed to fetch properties:", res.statusText)
      return
    }

    const json = await res.json()
// 🔥 detect where actual array is
let raw = []

if (Array.isArray(json)) {
  raw = json
} else if (Array.isArray(json.data)) {
  raw = json.data
} else if (Array.isArray(json.properties)) {
  raw = json.properties
} else if (Array.isArray(json.result)) {
  raw = json.result
} else {
  console.warn("❌ Could not detect property array in API response")
}
const mapped = (raw || [])
  .map((p: any, index: number) => {

   const coordsObj = p?.location?.coordinates

if (!coordsObj) {
  console.warn("❌ No location for property:", p.id)
  return null
}

let lat = null
let lng = null

// CASE 1 → .NET driver format
if (coordsObj?.values && Array.isArray(coordsObj.values)) {
  lat = Number(coordsObj.values[0])
  lng = Number(coordsObj.values[1])
}

// CASE 2 → Mongo GeoJSON
else if (Array.isArray(coordsObj)) {
  lng = Number(coordsObj[0])
  lat = Number(coordsObj[1])
}

// CASE 3 → x y format
else if (coordsObj?.x && coordsObj?.y) {
  lat = Number(coordsObj.x)
  lng = Number(coordsObj.y)
}

if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
  console.warn("❌ Invalid coords after parse:", coordsObj)
  return null
}
  // ✅ SMART transaction detection
    const t = String(p.youAreHereTo || "")
      .trim()
      .toLowerCase()

    let type: "sale" | "rent" = "sale"

    if (
      t.includes("rent") ||
      t.includes("rental") ||
      t.includes("lease")
    ) {
      type = "rent"
    }
  return {
  id: p.id || p._id || index,

  title: p.title,
  description: p.description,

  price: `${p.price} ${p.priceUnit}`,
  rawPrice: p.price,
  priceUnit: p.priceUnit,

  lat,
  lng,

  type,

  address: p.fullAddress,
  city: p.city,
  locality: p.locality,

  beds: p.bedrooms,
  baths: p.bathrooms,

  area: p.area,
  areaUnit: p.areaUnit,

  category: p.propertyCategory,

  contactPersonName: p.contactPersonName,
  email: p.email,
  whatsapp: p.whatsapp,

  imageUrl:p.uploadedImages?.[0],

  uploadedImages: p.uploadedImages || [],

  createdAt: p.createdAt,
}

  })
  .filter(Boolean)
setProperties(mapped)

  } catch (e) {
    console.warn("🔥 Error fetching properties:", e)
  }
}

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

  // fetch properties once Leaflet is loaded / on mount
  useEffect(() => {
    fetchProperties()
  }, [])

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L || mapRef.current || !userLocation) {
      console.warn("Cannot initialize map: missing requirements")
      return
    }

    const L = window.L

    try {
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
      const initialZoom = showUserLocationOnStart ? getOptimalZoom(userLocation.accuracy) : zoom
      map.setView([userLocation.lat, userLocation.lng], initialZoom)

      // Add zoom listener
      map.on('zoomend', () => {
        if (onZoomChange) {
          onZoomChange(map.getZoom())
        }
      })

      // Wait for map to be ready before adding markers
      map.whenReady(() => {
        console.log("Map is ready, adding initial markers")

        // Add user location marker if showing user location on start
        if (showUserLocationOnStart) {
          addUserLocationMarker(userLocation)
        } else {
          // Add city boundary for initial location
          // addCityBoundary(userLocation)
        }

        // Add property markers using real data
        addPropertyMarkers(map, L)
      })
    } catch (e) {
      console.error("Error initializing map:", e)
    }
  }

  const addPropertyMarkers = (map: any, L: any) => {
    if (!map || !L) return

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker))
    markersRef.current = []

    const createCustomIcon = (type: string, saleType?: string) => {
      const colors = {
        rental: "#3B82F6", // Blue for rental (swapped)
        sale: "#EF4444", // Red for sale (swapped) - default red
        "sale-luxury": "#8B5CF6", // Purple for luxury sale properties
        "sale-commercial": "#F59E0B", // Orange for commercial sale properties
        "sale-residential": "#EF4444", // Red for residential sale properties
      }

      // Determine the color based on type and saleType
      let color = colors.sale // default
      if (type === "rent") {
        color = colors.rental
      } else if (type === "sale") {
        if (saleType === "luxury") {
          color = colors["sale-luxury"]
        } else if (saleType === "commercial") {
          color = colors["sale-commercial"]
        } else {
          color = colors["sale-residential"]
        }
      }

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

    // Filter and add property markers based on toggles
    properties
      .filter(
        (property) =>
          (showSale && (property.type === "sale" || property.type?.startsWith("sale-"))) ||
          (showRental && property.type === "rent")
      )
      .forEach((property) => {
        try {
          // Determine saleType for icon color
          let saleType = "residential" // default
          if (property.type === "sale-luxury") saleType = "luxury"
          else if (property.type === "sale-commercial") saleType = "commercial"
          
          const marker = L.marker([property.lat, property.lng], {
           icon: createCustomIcon(property.type, saleType),
          }).addTo(map)

          // Build a rich popup card matching the exact attached design
          const rawImage =
  (property as any).uploadedImages?.[0] ||
  (property as any).imageUrl;

    let img =
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop";

    if (rawImage) {
      if (rawImage.startsWith("http")) {
        img = rawImage;
      } else if (rawImage.startsWith("/9j/")) {
        img = `data:image/jpeg;base64,${rawImage}`;
      } else if (rawImage.startsWith("iVBOR")) {
        img = `data:image/png;base64,${rawImage}`;
      }
    }

          const beds = (property as any).beds ?? "2";  const baths = (property as any).baths ?? '2'
          
          // Handle area display - use area field if available, otherwise fallback to sqft
          let areaDisplay = ''
          if ((property as any).area) {
            // Use the area field which already contains unit (e.g., "1800 sq ft", "200 sqyard")
            areaDisplay = (property as any).area
          } else if ((property as any).sqft) {
            // Fallback to sqft for backward compatibility
            areaDisplay = `${(property as any).sqft} sqft`
          } else {
            areaDisplay = 'Area not specified'
          }
          
          const address = (property as any).address || 'Sample Address, Near Mall'
          const floorNumber = (property as any).floorNumber ?? '3'
          const totalFloors = (property as any).totalFloors ?? '5'
          const facing = (property as any).facing || 'North'
          const locality = (property as any).locality || 'Koramangala'
          const city = (property as any).city || 'Bangalore'

          const heart = `<div style="position:absolute;right:8px;top:8px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer;" onclick="event.stopPropagation();">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>`
          
          const closeBtn = `<div style="position:absolute;left:-12px;top:-12px;width:28px;height:28px;border-radius:50%;background:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:1001;" onclick="event.stopPropagation(); window.closeLeafletPopup()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </div>`

          // Share Container (initially hidden)
          const shareContainer = `
            <div id="share-container-${property.id}" style="display:none; position:absolute; top:40px; right:8px; background:white; border-radius:8px; box-shadow:0 6px 20px rgba(0,0,0,0.15); padding:16px; width:250px; z-index:1000;" onclick="event.stopPropagation();">
              <div style="text-align:center; margin-bottom:12px;">
                <h3 style="font-size:16px; font-weight:600; color:#111827; margin:0;">Share Property</h3>
              </div>
              
              <div style="display:flex; justify-content:center; gap:12px; margin-bottom:12px;">
                <div onclick="event.stopPropagation(); window.shareProperty('email', ${property.id})" style="width:40px; height:40px; border-radius:50%; background:#6B7280; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;" 
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </div>
                
                <div onclick="event.stopPropagation(); window.shareProperty('whatsapp', ${property.id})" style="width:40px; height:40px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                </div>
                
                <div onclick="event.stopPropagation(); window.shareProperty('facebook', ${property.id})" style="width:40px; height:40px; border-radius:50%; background:#1877F2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                
                <div onclick="event.stopPropagation(); window.shareProperty('twitter', ${property.id})" style="width:40px; height:40px; border-radius:50%; background:#1DA1F2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </div>
              </div>
              
              <div style="border-top:1px solid #E5E7EB; padding-top:12px;">
                <div style="display:flex; gap:6px; align-items:center;">
                  <input 
                    type="text" 
                    id="share-link-${property.id}"
                    value="http://mbtrk.co/jWThMOwS6LMznDr6eNCt..."
                    readonly 
                    style="flex:1; padding:6px 10px; border:1px solid #D1D5DB; border-radius:4px; font-size:12px; background:#F9FAFB;"
                    onclick="event.stopPropagation();"
                  />
                  <button 
                    onclick="event.stopPropagation(); window.copyShareLink(${property.id})"
                    style="padding:6px 12px; background:#EF4444; color:white; border:none; border-radius:4px; font-size:12px; font-weight:500; cursor:pointer;"
                    onmouseover="this.style.background='#DC2626'" 
                    onmouseout="this.style.background='#EF4444'"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          `

          // Three dots menu
          const threeDots = `<div style="position:absolute;right:48px;top:8px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer;" onclick="event.stopPropagation(); window.toggleShareContainer(${property.id})">
              <div style="display:flex;gap:2px; color: #666;">
                <div style="width:3px;height:3px;background:currentColor;border-radius:50%;"></div>
                <div style="width:3px;height:3px;background:currentColor;border-radius:50%;"></div>
                <div style="width:3px;height:3px;background:currentColor;border-radius:50%;"></div>
              </div>
            </div>`

          const popupContent = `
            <div style="position:relative;">
              ${closeBtn}
              <div onclick="window.open('/property/${property.id}', '_blank')" style="width:400px; cursor:pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:white; border-radius:8px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                ${shareContainer}
                
                <!-- Image Section -->
                <div style="position:relative; width:100%; height:160px; overflow:hidden;">
                  <img src="${img}" alt="${property.title}" style="width:100%; height:100%; object-fit:cover; display:block;"/>
                  ${heart}
                  ${threeDots}
                </div>
                
                <!-- Content Section -->
                <div style="padding:12px 16px 16px 16px;">
                  <!-- Row 1: Property Type and Status -->
                  <div style="margin-bottom:6px;">
                    <span style="color:#333; font-size:14px; font-weight:600; line-height:1.3; display:block;">
                      ${beds} BHK Flat FOR ${property.type === 'sell'|| property.type === 'sale' ? 'SALE' : 'RENT'} in ${locality}, ${city}
                    </span>
                  </div>
                  
                  <!-- Row 2: Price -->
                  <div style="margin-bottom:10px;">
                    <span style="color:#000; font-size:18px; font-weight:700; display:block;">${property.price}</span>
                  </div>
                  
                  <!-- Row 3: Details with icons - Flexible wrap layout -->
                  <div style="display:flex; flex-wrap:wrap; gap:6px 12px; margin-bottom:8px; font-size:12px; color:#666;">
                    <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
                      <span style="white-space:nowrap;">${areaDisplay} ${property.areaUnit}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
                      <img src="/icons/bed.png" width="14" height="14" style="object-fit:contain" alt="Beds" />
                      <span style="white-space:nowrap;">${beds} Beds</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
                      <img src="/icons/bath.png" width="14" height="14" style="object-fit:contain" alt="Baths" />
                      <span style="white-space:nowrap;">${baths} Baths</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                        <path d="M12 2v2"/>
                        <path d="M12 20v2"/>
                        <path d="M4.93 4.93l1.41 1.41"/>
                        <path d="M17.66 17.66l1.41 1.41"/>
                        <path d="M2 12h2"/>
                        <path d="M20 12h2"/>
                        <path d="M6.34 17.66l-1.41 1.41"/>
                        <path d="M19.07 4.93l-1.41 1.41"/>
                      </svg>
                      <span style="white-space:nowrap;">${facing}</span>
                    </div>
                    ${floorNumber !== '' && totalFloors !== '' ? `
                      <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 21h18"/>
                          <path d="M5 21V7l8-4v18"/>
                          <path d="M19 21V11l-6-4"/>
                        </svg>
                        <span style="white-space:nowrap;">${floorNumber === '0' ? 'Ground' : floorNumber} of ${totalFloors} Floors</span>
                      </div>
                    ` : ''}
                  </div>
                  
                  <!-- Row 4: Address -->
                  <div style="color:#888; font-size:12px; line-height:1.4; word-wrap:break-word; overflow-wrap:break-word;">
                    ${address}
                  </div>
                </div>
              </div>
            </div>
          `

          marker.bindPopup(popupContent, {
            closeButton: false,
            className: 'custom-popup',
            maxWidth: 400,
            minWidth: 400
          })

          markersRef.current.push(marker)
        } catch (e) {
          console.warn("Error adding property marker:", e)
        }
      })

    // Add global handlers for sharing functionality
    if (typeof window !== 'undefined') {
      (window as any).closeLeafletPopup = () => {
        if (mapRef.current) {
          mapRef.current.closePopup()
        }
      }

      (window as any).propertyDetailsHandler = (propertyId: number) => {
        router.push(`/property/${propertyId}`)
      }

      // Toggle share container visibility
      (window as any).toggleShareContainer = (propertyId: number) => {
        const container = document.getElementById(`share-container-${propertyId}`)
        if (container) {
          container.style.display = container.style.display === 'none' ? 'block' : 'none'
        }
      }

      // Share property function
      (window as any).shareProperty = (platform: string, propertyId: number) => {
        const propertyUrl = `${window.location.origin}/property/${propertyId}`
        const property = properties.find(p => p.id === propertyId)
        const title = property ? `${property.title} - ${property.price}` : 'Check out this property'
        
        switch (platform) {
          case 'email':
            window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(propertyUrl)}`)
            break
          case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${propertyUrl}`)}`)
            break
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`)
            break
          case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(propertyUrl)}`)
            break
        }
      }

      // Copy share link function
      (window as any).copyShareLink = async (propertyId: number) => {
        const input = document.getElementById(`share-link-${propertyId}`) as HTMLInputElement
        if (input) {
          try {
            await navigator.clipboard.writeText(input.value)
            const button = input.nextElementSibling as HTMLButtonElement
            if (button) {
              const originalText = button.textContent
              button.textContent = 'Copied!'
              button.style.background = '#10B981'
              setTimeout(() => {
                button.textContent = originalText
                button.style.background = '#EF4444'
              }, 2000)
            }
          } catch (err) {
            // Fallback for older browsers
            input.select()
            document.execCommand('copy')
          }
        }
      }
    }
  }

  // When properties change, refresh markers (if map is ready)
  useEffect(() => {
    if (mapRef.current && window.L && properties.length > 0) {
      addPropertyMarkers(mapRef.current, window.L)
    }
  }, [properties, showSale, showRental])

  const addCityBoundary = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.L) {
      console.warn("Map or Leaflet not available when trying to add city boundary")
      return
    }

    const L = window.L
    const map = mapRef.current

    // Verify map is properly initialized
    if (!map || typeof map.addLayer !== 'function') {
      console.warn("Map not properly initialized for city boundary")
      return
    }

    // Remove existing city outline
    if (userMarkerRef.current) {
      try {
        map.removeLayer(userMarkerRef.current)
      } catch (e) {
        console.warn("Error removing city outline:", e)
      }
      userMarkerRef.current = null
    }

    // Find the closest city to location
    const closestCity = findClosestCity(location, cities)
    if (closestCity && closestCity.name) {
      try {
        const boundary = closestCity.name
        const polygon = L.polygon(boundary, {
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.1,
          weight: 2,
        })

        if (polygon && map && typeof map.addLayer === 'function') {
          polygon.addTo(map)
          userMarkerRef.current = polygon
        }
      } catch (e) {
        console.warn("Error creating city boundary:", e)
      }
    }
  }

  const addUserLocationMarker = (location: { lat: number; lng: number; accuracy?: number }) => {
    if (!mapRef.current || !window.L) {
      console.warn("Map or Leaflet not available when trying to add user location marker")
      return
    }

    const L = window.L
    const map = mapRef.current

    // Verify map is properly initialized
    if (!map || typeof map.addLayer !== 'function') {
      console.warn("Map not properly initialized")
      return
    }

    // Remove existing user marker and accuracy circle
    if (userMarkerRef.current) {
      try {
        map.removeLayer(userMarkerRef.current)
      } catch (e) {
        console.warn("Error removing user marker:", e)
      }
      userMarkerRef.current = null
    }
    if (accuracyCircleRef.current) {
      try {
        map.removeLayer(accuracyCircleRef.current)
      } catch (e) {
        console.warn("Error removing accuracy circle:", e)
      }
      accuracyCircleRef.current = null
    }

    // Add accuracy circle if available and reasonable
    if (location.accuracy && location.accuracy < 500) {
      try {
        const accuracyCircle = L.circle([location.lat, location.lng], {
          radius: location.accuracy,
          color: "#EF4444",
          fillColor: "#EF4444",
          fillOpacity: 0.1,
          weight: 2,
          dashArray: "3, 3",
        })

        // Verify circle was created successfully before adding to map
        if (accuracyCircle && map && typeof map.addLayer === 'function') {
          accuracyCircle.addTo(map)
          accuracyCircleRef.current = accuracyCircle
        }
      } catch (e) {
        console.warn("Error creating accuracy circle:", e)
      }
    }

    // Add user location marker with enhanced styling
    try {
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
      })

      if (userMarker && map && typeof map.addLayer === 'function') {
        userMarker.addTo(map)

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
    } catch (e) {
      console.warn("Error creating user marker:", e)
    }
  }

  // Add helper function to find closest city with proper typing
  const findClosestCity = (
    userLoc: { lat: number; lng: number },
    cityList: { name: string; lat: number; lng: number }[]
  ): { name: string; lat: number; lng: number } | null => {
    let closestCity: { name: string; lat: number; lng: number } | null = null
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

    // Verify selectedCity is not null and has required properties
    if (!selectedCity || typeof selectedCity.lat !== 'number' || typeof selectedCity.lng !== 'number') {
      console.warn("Invalid city data provided to MapComponent")
      return
    }

    // Remove user location marker and accuracy circle when selecting a city
    if (userMarkerRef.current) {
      try {
        map.removeLayer(userMarkerRef.current)
        userMarkerRef.current = null
      } catch (e) {
        console.warn("Could not remove user marker:", e)
      }
    }
    if (accuracyCircleRef.current) {
      try {
        map.removeLayer(accuracyCircleRef.current)
        accuracyCircleRef.current = null
      } catch (e) {
        console.warn("Could not remove accuracy circle:", e)
      }
    }

    // Zoom to selected city with validation
    try {
      map.setView([selectedCity.lat, selectedCity.lng], zoom)
    } catch (e) {
      console.error("Error setting map view for city:", e)
    }

    // Add city boundary
   // addCityBoundary(selectedCity)

    // Notify that we're no longer viewing current location
    if (onViewChange) {
      setTimeout(() => onViewChange(false), 500)
    }
  }, [selectedCity, onViewChange])

  // Handle recenter trigger
  useEffect(() => {
    if (!mapRef.current || !recenterTrigger || !window.L) return

    const map = mapRef.current

    if (!map || typeof map.setView !== 'function') {
      console.warn("Map not ready for recenter")
      return
    }

    try {
      // Use a more appropriate zoom level for user's location
      const newZoom = getOptimalZoom(recenterTrigger.accuracy)
      map.setView([recenterTrigger.lat, recenterTrigger.lng], newZoom)

      // Add user location marker back
      addUserLocationMarker(recenterTrigger)

      // Notify that we are now viewing the current location
      if (onViewChange) {
        onViewChange(true)
      }
      
      // Update zoom state
      if (onZoomChange) {
        onZoomChange(newZoom)
      }

    } catch (e) {
      console.error("Error recentering map:", e)
    }
  }, [recenterTrigger, onViewChange])

  // Initialize map when Leaflet loads and userLocation is available
  useEffect(() => {
    if (leafletLoaded.current && userLocation && !mapRef.current) {
      // Add small delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap()
      }, 100)
    }
  }, [userLocation, showUserLocationOnStart])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Custom Popup Styling */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .custom-popup .leaflet-popup-tip-container {
          display: none;
        }
        .custom-popup .leaflet-popup-close-button {
          display: none; /* Hide default close button */
        }
        /* Ensure close button is clickable */
        .custom-popup .leaflet-popup-content-wrapper > div > div[style*="position:absolute"][style*="left:-12px"] {
          pointer-events: auto !important;
          z-index: 1001 !important;
        }
      `}</style>

      {/* Map View Tracker with proper bounds detection */}
      {onViewChange && userLocation && (
        <MapViewTracker
          mapRef={mapRef}
          userLocation={userLocation}
          onViewChange={onViewChange}
        />
      )}

      {/* Property Type Toggle */}
      <PropertyTypeToggle
        showSale={showSale}
        showRental={showRental}
        onSaleToggle={setShowSale}
        onRentalToggle={setShowRental}
      />
    </div>
  )
}
