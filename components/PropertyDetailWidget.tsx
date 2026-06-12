"use client"

import React, { useState } from "react"
import ContactOwnerDialog from "./ContactOwnerDialog"

interface Property {
  id: number | string

  // normalized payload
  title?: string
  price?: any
  address?: string
  beds?: number
  baths?: number
  area?: string
  floorNumber?: string
  totalFloors?: string
  facing?: string
  city?: string
  locality?: string
  type?: string
  propertyCategory?: string

  // raw api payload
  bedrooms?: any
  bathrooms?: any
  areaUnit?: string
  fullAddress?: string
  priceUnit?: string
  youAreHereTo?: string
  whatsapp?: any
  phone?: any
  contactPhone?: any
}

interface Props {
  property: Property
}

export const PropertyDetailWidget: React.FC<Props> = ({ property }) => {

  // ⭐ DEBUGGER
  console.log("✅ WIDGET PROPERTY =", property)

  if (!property) return null

  const beds =
    property.beds ??
    (property.bedrooms ? Number(property.bedrooms) : undefined)

  const baths =
    property.baths ??
    (property.bathrooms ? Number(property.bathrooms) : undefined)

  const area =
    property.area ||
    ((property as any).area && property.areaUnit
      ? `${(property as any).area} ${property.areaUnit}`
      : "")

  const address =
    property.address ||
    property.fullAddress ||
    ""

  const city = property.city || ""
  const locality = property.locality || ""

  const price =
    property.price
      ? typeof property.price === "string"
        ? property.price
        : `₹ ${Number(property.price).toLocaleString()} ${
            property.priceUnit ? `/ ${property.priceUnit}` : ""
          }`
      : ""

  const type =
    property.type ||
    (property.youAreHereTo === "rental"
      ? "rental"
      : property.propertyCategory
      ? `sale-${property.propertyCategory}`
      : "")

  const [open, setOpen] = useState(false)

  return (
    <div className="w-full pt-4 pb-4 pl-4 pr-4">
      <div className="bg-white rounded-md">
        <div style={{ padding: 12 }}>

          {/* TITLE */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ color:'#333', fontSize:14, fontWeight:600 }}>
              {beds ? `${beds} BHK` : ""} Flat FOR {(type || "").includes("sale") ? "SALE" : "RENT"}
              {locality ? ` in ${locality}` : ""}
              {city ? `, ${city}` : ""}
            </span>
          </div>

          {/* PRICE */}
          {price && (
            <div style={{ marginBottom:10 }}>
              <span style={{ color:"#000", fontSize:18, fontWeight:700 }}>
                {price}
              </span>
            </div>
          )}

          {/* DETAILS */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 12px", marginBottom:8, fontSize:12, color:"#666" }}>

            {area && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <img  width={14} height={14}/>
                <span>{area}</span>
              </div>
            )}

            {beds !== undefined && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <img src="/icons/bed.png" width={14} height={14}/>
                <span>{beds} Beds</span>
              </div>
            )}

            {baths !== undefined && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <img src="/icons/bath.png" width={14} height={14}/>
                <span>{baths} Baths</span>
              </div>
            )}

            {property.facing && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <img src="/icons/balcony.png" width={14} height={14}/>
                <span>{property.facing}</span>
              </div>
            )}

            {property.floorNumber && property.totalFloors && (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <img src="/icons/balcony.png" width={14} height={14}/>
                <span>
                  {property.floorNumber === "0" ? "Ground" : property.floorNumber}
                  {" "}of {property.totalFloors} Floors
                </span>
              </div>
            )}

          </div>

          {/* ADDRESS */}
          <div style={{ color:"#888", fontSize:12 }}>
            {address}
          </div>

          {/* BUTTONS */}
          <div style={{ display:"flex", gap:16, marginTop:24 }}>
            <button
              style={{
                background:"#e53935",
                color:"white",
                borderRadius:24,
                padding:"12px 32px",
                fontWeight:600,
                fontSize:16,
                border:"none"
              }}
              onClick={()=>setOpen(true)}
            >
              Contact Owner
            </button>

            <button
              style={{
                background:"white",
                color:"#e53935",
                border:"2px solid #e53935",
                borderRadius:24,
                padding:"12px 32px",
                fontWeight:600,
                fontSize:16
              }}
              onClick={()=>setOpen(true)}
            >
              Get Phone No.
            </button>
          </div>

        </div>
      </div>

      <ContactOwnerDialog
        isOpen={open}
        onClose={()=>setOpen(false)}
        ownerContact={
          property.whatsapp ||
          property.phone ||
          property.contactPhone ||
          "+91 9876543210"
        }
        propertyId={property.id}
      />
    </div>
  )
}

export default PropertyDetailWidget