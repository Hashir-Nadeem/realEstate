"use client"

import React from "react"
import {
  Bath,
  Bed,
  Ruler,
  Building2,
  MapPin,
  Layers,
} from "lucide-react"

interface Property {
  id: number | string
  title: string
  price: string
  address?: string
  beds?: number
  baths?: number
  area?: string
  sqft?: number
  floorNumber?: string
  totalFloors?: string
  facing?: string
  city?: string
  locality?: string
  type?: string
  propertyCategory?: string
  description?: string
}

interface Props {
  property: Property
}

export const PropertyDetailWidget: React.FC<Props> = ({ property }) => {
  const { title, price, address, beds, baths, area, description, locality, city, type } = property
  return (
    <div className="w-full pt-4 pb-4 pl-4 pr-4">
      <div className="bg-white rounded-md ">
        <div style={{ padding: 12 }}>
          {/* Row 1: Title line - small, semibold (matches popup) */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: '#333', fontSize: 14, fontWeight: 600, lineHeight: 1.3, display: 'block' }}>
              {beds ? `${beds} BHK` : ''} Flat FOR {type && type.includes('sale') ? 'SALE' : 'RENT'}{locality ? ` in ${locality}` : ''}{city ? `, ${city}` : ''}
            </span>
          </div>

          {/* Row 2: Price (popup used 18px bold) */}
          {price && (
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: '#000', fontSize: 18, fontWeight: 700, display: 'block' }}>{price}</span>
            </div>
          )}

          {/* Row 3: Details with icons (compact, text-xs equivalent) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginBottom: 8, fontSize: 12, color: '#666' }}>
            {/* Area icon (inline SVG from popup) */}
            {area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L22 22H2L12 2z"/>
                  <path d="M12 8v6"/>
                  <path d="M8 18h8"/>
                </svg>
                <span>{area}</span>
              </div>
            )}

            {/* Beds icon */}
            {beds !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
                  <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                  <path d="M12 10v10" />
                  <path d="M2 14h20" />
                  <path d="M7 18h2" />
                  <path d="M15 18h2" />
                </svg>
                <span>{beds} Beds</span>
              </div>
            )}

            {/* Baths icon - popup used image */}
            {baths !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <img src="/icons/bath.png" width={14} height={14} style={{ objectFit: 'contain' }} alt="Bathroom" />
                <span>{baths} Baths</span>
              </div>
            )}

            {/* Facing / balcony icon - popup used image */}
            {property.facing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <img src="/icons/balcony.png" width={14} height={14} style={{ objectFit: 'contain' }} alt="Facing" />
                <span>{property.facing}</span>
              </div>
            )}

            {/* Floor info if available */}
            {property.floorNumber && property.totalFloors && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <img src="/icons/balcony.png" width={14} height={14} style={{ objectFit: 'contain' }} alt="Floors" />
                <span>{property.floorNumber === '0' ? 'Ground' : property.floorNumber} of {property.totalFloors} Floors</span>
              </div>
            )}
          </div>

          {/* Row 4: Address */}
          <div style={{ color: '#888', fontSize: 12, lineHeight: 1.4, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {address}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailWidget
