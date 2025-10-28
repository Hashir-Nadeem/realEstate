"use client"

import React from 'react'

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
  property: PropItem
  onHeartClick?: (e: React.MouseEvent) => void
}

export default function PropertyCard({ property: p, onHeartClick }: Props) {
  const getPropertyImage = (p: PropItem) => {
    return p.imageUrl || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop"
  }

  const getAreaDisplay = (p: PropItem) => {
    if (p.area) {
      return p.area
    } else if (p.sqft) {
      return `${p.sqft} sqft`
    } else {
      return 'Area not specified'
    }
  }

  const beds = p.beds ?? '2'
  const baths = p.baths ?? '2'
  const areaDisplay = getAreaDisplay(p)
  const address = p.address || 'Sample Address, Near Mall'
  const floorNumber = p.floorNumber ?? '3'
  const totalFloors = p.totalFloors ?? '5'
  const facing = p.facing || 'North'
  const locality = p.locality || 'Koramangala'
  const city = p.city || 'Bangalore'
  const img = getPropertyImage(p)

  return (
    <div className="block cursor-pointer">
      <div style={{
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        background: 'white'
      }}>
        {/* Image Section */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden'
        }}>
          <img 
            src={img} 
            alt={p.title || 'Property'} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          {/* Heart icon */}
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }} onClick={onHeartClick || ((e) => e.stopPropagation())}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>
        
        {/* Content Section */}
        <div style={{ padding: '12px 16px' }}>
          {/* Row 1: Property Type and Status with Locality */}
          <div style={{ marginBottom: '6px' }}>
            <span style={{
              color: '#333',
              fontSize: '14px',
              fontWeight: '600',
              lineHeight: '1.3',
              display: 'block'
            }}>
              {beds} BHK Flat FOR {p.type && p.type.includes('sale') ? 'SALE' : 'RENT'} in {locality}, {city}
            </span>
          </div>
          
          {/* Row 2: Price */}
          <div style={{ marginBottom: '10px' }}>
            <span style={{
              color: '#000',
              fontSize: '18px',
              fontWeight: '700',
              display: 'block'
            }}>
              {p.price}
            </span>
          </div>
          
          {/* Row 3: Details with icons - Include all details */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 12px',
            marginBottom: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L22 22H2L12 2z"/>
                <path d="M12 8v6"/>
                <path d="M8 18h8"/>
              </svg>
              <span>{areaDisplay}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/>
                <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
                <path d="M12 10v10"/>
                <path d="M2 14h20"/>
                <path d="M7 18h2"/>
                <path d="M15 18h2"/>
              </svg>
              <span>{beds} Beds</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5m0-7v7m0-7h5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-5m0-7V4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2Z"/>
              </svg>
              <span>{baths} Baths</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span>{facing}</span>
            </div>
            {floorNumber !== '' && totalFloors !== '' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
                <span>{floorNumber === '0' ? 'Ground' : floorNumber} of {totalFloors} Floors</span>
              </div>
            )}
          </div>
          
          {/* Row 4: Address */}
          <div style={{
            color: '#888',
            fontSize: '12px',
            lineHeight: '1.4',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {address}
          </div>
        </div>
      </div>
    </div>
  )
}
