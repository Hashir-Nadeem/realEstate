"use client"

import React, { useState } from "react"
import {
  Bath,
  Bed,
  Ruler,
  Building2,
  MapPin,
  Layers,
} from "lucide-react"
import ContactOwnerDialog from "./ContactOwnerDialog"

interface Property {
  whatsapp: any
  phone: any
  contactPhone: any
  contactPersonName: any
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
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

  const handleContactClick = () => {
    setIsContactDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsContactDialogOpen(false)
  }

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
            {/* Area icon replaced with ruler image (fallback to SVG) */}
            {area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <img
                  src="/icons/ruler.png"
                  alt="Area"
                  width={14}
                  height={14}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = 'true'
                      target.src = '/icons/Ruler.svg'
                    }
                  }}
                />
                <span>{area}</span>
              </div>
            )}

            {/* Beds icon replaced with bed image */}
            {beds !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <img
                  src="/icons/bed.png"
                  alt="Beds"
                  width={14}
                  height={14}
                  style={{ objectFit: 'contain' }}
                />
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

          {/* Contact Owner & Get Phone No. Buttons */}
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <button
              type="button"
              style={{
                background: '#e53935',
                color: 'white',
                border: 'none',
                borderRadius: 24,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                outline: 'none',
              }}
              onClick={handleContactClick}
            >
              Contact Owner
            </button>
            <button
              type="button"
              style={{
                background: 'white',
                color: '#e53935',
                border: '2px solid #e53935',
                borderRadius: 24,
                padding: '12px 32px',
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                outline: 'none',
              }}
              onClick={handleContactClick}
            >
              Get Phone No.
            </button>
          </div>
        </div>
      </div>

      {/* Contact Owner Dialog */}
      <ContactOwnerDialog
        isOpen={isContactDialogOpen}
        onClose={handleCloseDialog}
        ownerContact={property.whatsapp || property.phone || property.contactPhone || '+91 98765 43210'}
        propertyId={property.id}
      />
    </div>
  )
}

export default PropertyDetailWidget
