"use client"

import React from "react"
import Link from "next/link"
import PropertyCard from "./PropertyCard"

type PropItem = {
  id?: number | string
  _id?: number | string
  propertyId?: number | string

  title?: string
  price?: string
  address?: string
  beds?: number | string
  baths?: number | string
  area?: string
  sqft?: number

  lat?: number | string
  lng?: number | string

  floorNumber?: string
  totalFloors?: string
  facing?: string
  locality?: string
  city?: string
  type?: string
  imageUrl?: string
}

interface Props {
  items: PropItem[]
}

export default function NearestPropertiesList({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No nearby properties found.
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        Nearby properties
      </h3>

      <div className="space-y-4">
        {items.map((p, i) => {
          const pid =
            p.id ||
            p._id ||
            p.propertyId

          if (!pid) return null

          const normalized = {
            ...p,
            id: pid,
            lat: p.lat ? Number(p.lat) : undefined,
            lng: p.lng ? Number(p.lng) : undefined,
          }

          return (
            <Link key={pid || i} href={`/property/${pid}`}>
              <PropertyCard property={normalized as any} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}