"use client"

import React from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL!

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
  images?: string[]
  photos?: string[]
}

interface Props {
  property: PropItem
  onHeartClick?: (e: React.MouseEvent) => void
}

export default function PropertyCard({ property: p, onHeartClick }: Props) {

  const buildImageUrl = (img?: string) => {
    if (!img) return "/no-image.png"

    if (img.startsWith("http")) return img

    if (img.startsWith("/")) return `${API_BASE}${img}`

    return `${API_BASE}/${img}`
  }

  const getPropertyImage = (p: PropItem) => {
    // ⭐ priority order
    if (p.imageUrl) return buildImageUrl(p.imageUrl)

    if (p.images && p.images.length > 0)
      return buildImageUrl(p.images[0])

    if (p.photos && p.photos.length > 0)
      return buildImageUrl(p.photos[0])

    return "/no-image.png"
  }

  const getAreaDisplay = (p: PropItem) => {
    if (p.area) return p.area
    if (p.sqft) return `${p.sqft} sqft`
    return "Area not specified"
  }

  const beds = p.beds ?? "2"
  const baths = p.baths ?? "2"
  const areaDisplay = getAreaDisplay(p)
  const address = p.address || "Sample Address"
  const floorNumber = p.floorNumber ?? "3"
  const totalFloors = p.totalFloors ?? "5"
  const facing = p.facing || "North"
  const locality = p.locality || "Locality"
  const city = p.city || "City"
  const img = getPropertyImage(p)

  return (
    <div className="block cursor-pointer">
      <div
        style={{
          position: "relative",
          maxWidth: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          background: "white",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden",
          }}
        >
          <img
            src={img}
            alt={p.title || "Property"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Heart */}
          <div
            style={{
              position: "absolute",
              right: "8px",
              top: "8px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
            onClick={onHeartClick || ((e) => e.stopPropagation())}
          >
            ❤️
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ marginBottom: "6px" }}>
            <span
              style={{
                color: "#333",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {beds} BHK Flat FOR{" "}
              {p.type && p.type.includes("sale") ? "SALE" : "RENT"} in{" "}
              {locality}, {city}
            </span>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <span
              style={{
                color: "#000",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {p.price}
            </span>
          </div>

          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            {areaDisplay} • {beds} Beds • {baths} Baths • {facing} • Floor{" "}
            {floorNumber}/{totalFloors}
          </div>

          <div style={{ color: "#888", fontSize: "12px" }}>{address}</div>
        </div>
      </div>
    </div>
  )
}