"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { calculateDistance } from '@/utils/locationUtils'
import PropertyCard from './PropertyCard'

interface PropItem {
  id: number | string
  title?: string
  price?: string
  address?: string
  beds?: number | string
  baths?: number | string
  area?: string
  sqft?: number
  lat?: number
  lng?: number
  floorNumber?: string
  totalFloors?: string
  facing?: string
  locality?: string
  city?: string
  type?: string
  imageUrl?: string
}

interface Props {
  currentProperty: any // expecting object with lat & lng and id
  limit?: number
}

export default function NearestPropertiesList({ currentProperty, limit = 5 }: Props) {
  const [items, setItems] = useState<PropItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentProperty) return

    const fetchAndCompute = async () => {
      try {
        const res = await fetch('/api/properties')
        const data = await res.json()

        // Debug: log the current property structure
        console.log('Current property full object:', currentProperty)

        // ensure current has lat/lng
        const curLat = (currentProperty as any).lat
        const curLng = (currentProperty as any).lng
        
        console.log('Current property coords:', { curLat, curLng, currentPropertyId: currentProperty.id })
        console.log('All available properties:', data.map((p: any) => ({ 
          id: p.id, 
          title: p.title, 
          lat: p.lat, 
          lng: p.lng 
        })))
        
        if (typeof curLat !== 'number' || typeof curLng !== 'number') {
          // if no coords, try to find the property in the fetched data
          console.log('Current property missing coordinates, trying to find in API data')
          const foundProperty = data.find((p: any) => p.id.toString() === currentProperty.id.toString())
          if (foundProperty && typeof foundProperty.lat === 'number' && typeof foundProperty.lng === 'number') {
            console.log('Found coordinates in API data:', { lat: foundProperty.lat, lng: foundProperty.lng })
            // Use coordinates from API data
            const apiLat = foundProperty.lat
            const apiLng = foundProperty.lng
            
            // Compute distances using API coordinates
            const withDist = (data || [])
              .filter((p: any) => p && p.lat !== undefined && p.lng !== undefined && p.id !== currentProperty.id)
              .map((p: any) => ({
                item: p,
                dist: calculateDistance(apiLat, apiLng, Number(p.lat), Number(p.lng))
              }))

            console.log('Properties with distances (using API coords):', withDist.map((d: any) => ({ 
              id: d.item.id, 
              title: d.item.title, 
              dist: d.dist.toFixed(2) + ' km',
              lat: d.item.lat,
              lng: d.item.lng 
            })))

            withDist.sort((a: any, b: any) => a.dist - b.dist)
            const nearest = withDist.slice(0, limit).map((d: any) => d.item)
            console.log('Nearest properties selected:', nearest.map((p: any) => ({ id: p.id, title: p.title })))
            setItems(nearest)
            return
          } else {
            console.log('Property not found in API data or missing coordinates, showing empty list')
            setItems([])
            return
          }
        }

        // compute distance for each property (skip missing lat/lng)
        const withDist = (data || [])
          .filter((p: any) => p && p.lat !== undefined && p.lng !== undefined && p.id !== currentProperty.id)
          .map((p: any) => ({
            item: p,
            dist: calculateDistance(curLat, curLng, Number(p.lat), Number(p.lng))
          }))

        console.log('Properties with distances:', withDist.map((d: any) => ({ 
          id: d.item.id, 
          title: d.item.title, 
          dist: d.dist.toFixed(2) + ' km',
          lat: d.item.lat,
          lng: d.item.lng 
        })))

        withDist.sort((a: any, b: any) => a.dist - b.dist)

        const nearest = withDist.slice(0, limit).map((d: any) => d.item)
        console.log('Nearest properties selected:', nearest.map((p: any) => ({ id: p.id, title: p.title })))
        
        setItems(nearest)
      } catch (err) {
        console.error('Failed to fetch properties for nearest list', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchAndCompute()
  }, [currentProperty, limit])

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading nearby properties...</div>
  if (!items || items.length === 0) return <div className="p-4 text-sm text-gray-500">No nearby properties found.</div>

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Nearby properties</h3>
      <div className="space-y-4 p-10">
        {items.map((p) => (
          <Link key={p.id} href={`/property/${p.id}`}>
            <div className="block cursor-pointer pb-8">
              <PropertyCard property={p} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
