"use client"

import { useEffect, useRef, useState } from "react"
import { MapViewTracker } from "./map/MapViewTracker"
import { getOptimalZoom } from "@/utils/mapUtils"
import { useRouter } from "next/navigation"

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

  const [showSale, setShowSale] = useState(true)
  const [showRental, setShowRental] = useState(true)

  // dynamic properties fetched from server (built-in + CSV submissions)
  const [properties, setProperties] = useState<any[]>([])
  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties")
      if (!res.ok) {
        console.warn("Failed to fetch properties:", res.statusText)
        return
      }
      const data = await res.json()
      setProperties(data || [])
    } catch (e) {
      console.warn("Error fetching properties:", e)
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

    const createCustomIcon = (type: string) => {
      const colors = {
        rental: "#EF4444", // Red for rental
        sale: "#3B82F6", // Blue for sale
      }

      const color = colors[type as keyof typeof colors] || "#6B7280"

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
          (showSale && property.type === "sale") ||
          (showRental && property.type === "rental")
      )
      .forEach((property) => {
        try {
          const marker = L.marker([property.lat, property.lng], {
            icon: createCustomIcon(property.type),
          }).addTo(map)

          // Build a rich popup card matching the exact attached design
          const img = (property as any).imageUrl || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop"
          const beds = (property as any).beds ?? ''
          const baths = (property as any).baths ?? ''
          const sqft = (property as any).sqft ?? ''
          const address = (property as any).address || ''
          const floorNumber = (property as any).floorNumber ?? ''
          const totalFloors = (property as any).totalFloors ?? ''
          const facing = (property as any).facing || ''

          const heart = `<div style="position:absolute;right:12px;top:12px;width:36px;height:36px;border-radius:9999px;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15); cursor:pointer;" onclick="event.stopPropagation();">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>`
          
          const closeBtn = `<div style="position:absolute;left: -10px; top: -10px; width:24px; height:24px; border-radius:50%; background:white; box-shadow:0 2px 5px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="event.stopPropagation(); this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </div>`

          // Property details with proper icons matching the design
          const detailsGrid = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; font-size:14px; color:#374151;">
              ${sqft ? `
                <div style="display:flex;align-items:center;gap:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 12h4v4"/></svg>
                  <span>${sqft.toLocaleString?.() || sqft} sqft</span>
                </div>
              ` : ''}
              ${beds !== '' ? `
                <div style="display:flex;align-items:center;gap:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 10v10"/></svg>
                  <span>${beds} Beds</span>
                </div>
              ` : ''}
              ${baths !== '' ? `
                <div style="display:flex;align-items:center;gap:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 12 4-10-8 4 4 6z"/><path d="M21.39 11.88a2.2 2.2 0 0 0-2.76 0L4 19.88a2.2 2.2 0 0 0 0 2.76 2.2 2.2 0 0 0 2.76 0L21.39 14.64a2.2 2.2 0 0 0 0-2.76z"/></svg>
                  <span>${baths} Baths</span>
                </div>
              ` : ''}
              ${facing ? `
                <div style="display:flex;align-items:center;gap:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/></svg>
                  <span>${facing.charAt(0).toUpperCase() + facing.slice(1)}</span>
                </div>
              ` : ''}
              ${(floorNumber !== '' && totalFloors !== '') ? `
                <div style="display:flex;align-items:center;gap:8px; grid-column: span 2;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
                  <span>${floorNumber === '0' ? 'Ground' : floorNumber} (Out of ${totalFloors} Floors)</span>
                </div>
              ` : ''}
            </div>
          `

          // Share Container (initially hidden)
          const shareContainer = `
            <div id="share-container-${property.id}" style="display:none; position:absolute; top:50px; right:12px; background:white; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.15); padding:20px; width:280px; z-index:1000;" onclick="event.stopPropagation();">
              <div style="text-align:center; margin-bottom:16px;">
                <h3 style="font-size:18px; font-weight:600; color:#111827; margin:0;">Share Property</h3>
              </div>
              
              <!-- Social Icons -->
              <div style="display:flex; justify-content:center; gap:16px; margin-bottom:16px;">
                <div onclick="event.stopPropagation(); window.shareProperty('email', ${property.id})" style="width:50px; height:50px; border-radius:50%; background:#6B7280; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;" 
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </div>
                
                <div onclick="event.stopPropagation(); window.shareProperty('whatsapp', ${property.id})" style="width:50px; height:50px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                </div>
                
                <div onclick="event.stopPropagation(); window.shareProperty('facebook', ${property.id})" style="width:50px; height:50px; border-radius:50%; background:#1877F2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                
                <div onclick="event.stopPropagation(); window.shareProperty('twitter', ${property.id})" style="width:50px; height:50px; border-radius:50%; background:#1DA1F2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </div>
              </div>
              
              <!-- Copy Link Section -->
              <div style="border-top:1px solid #E5E7EB; padding-top:16px;">
                <div style="display:flex; gap:8px; align-items:center;">
                  <input 
                    type="text" 
                    id="share-link-${property.id}"
                    value="http://mbtrk.co/jWThMOwS6LMznDr6eNCt..."
                    readonly 
                    style="flex:1; padding:8px 12px; border:1px solid #D1D5DB; border-radius:6px; font-size:14px; background:#F9FAFB;"
                    onclick="event.stopPropagation();"
                  />
                  <button 
                    onclick="event.stopPropagation(); window.copyShareLink(${property.id})"
                    style="padding:8px 16px; background:#EF4444; color:white; border:none; border-radius:6px; font-size:14px; font-weight:500; cursor:pointer;"
                    onmouseover="this.style.background='#DC2626'" 
                    onmouseout="this.style.background='#EF4444'"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          `

          // Three dots menu with updated click handler to prevent event propagation
          const threeDots = `<div style="position:absolute;right:58px;top:12px;width:36px;height:36px;border-radius:9999px;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15); cursor:pointer;" onclick="event.stopPropagation(); window.toggleShareContainer(${property.id})">
              <div style="display:flex;gap:2px; color: #9CA3AF;">
                <div style="width:4px;height:4px;background:currentColor;border-radius:50%;"></div>
                <div style="width:4px;height:4px;background:currentColor;border-radius:50%;"></div>
                <div style="width:4px;height:4px;background:currentColor;border-radius:50%;"></div>
              </div>
            </div>`

          const popupContent = `
            <div onclick="window.propertyDetailsHandler(${property.id})" style="width:300px; cursor:pointer; font-family: sans-serif; position:relative;">
              ${closeBtn}
              ${shareContainer}
              <div style="position:relative;height:180px;overflow:hidden;background:#f3f4f6; border-radius: 12px 12px 0 0;">
                  <img src="${img}" alt="${property.title}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
                  ${heart}
                  ${threeDots}
              </div>
              <div style="padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                  <span style="background:#FEE2E2;color:#DC2626;padding:4px 10px;border-radius:16px;font-size:12px;font-weight:600;text-transform:uppercase;">${property.type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                </div>
                <div style="color:#111827;font-weight:700;font-size:24px;line-height:1.2;margin-bottom:12px;">${property.price}</div>
                ${detailsGrid}
                ${address ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;">${address}</div>` : ''}
              </div>
            </div>
          `

          marker.bindPopup(popupContent, {
            closeButton: true,
            className: 'custom-popup'
          })

          markersRef.current.push(marker)
        } catch (e) {
          console.warn("Error adding property marker:", e)
        }
      })

    // Add global handlers for sharing functionality
    if (typeof window !== 'undefined') {
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
    addCityBoundary(selectedCity)

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
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
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
      `}</style>

      {/* Map View Tracker with proper bounds detection */}
      {onViewChange && userLocation && (
        <MapViewTracker
          mapRef={mapRef}
          userLocation={userLocation}
          onViewChange={onViewChange}
        />
      )}

      {/* Map UI Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[1000]">
        <h4 className="font-semibold mb-2">Property Types</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Sale Properties</span>
            <div
              className={`ml-auto w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                showSale ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setShowSale((prev) => !prev)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  showSale ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Rental Properties</span>
            <div
              className={`ml-auto w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                showRental ? "bg-red-500" : "bg-gray-300"
              }`}
              onClick={() => setShowRental((prev) => !prev)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  showRental ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
