"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { generatePropertyPopupContent } from "@/components/map/PropertyPopupContent"
import { ListPageHeader } from "@/components/ListPageHeader"

const API_BASE = process.env.NEXT_PUBLIC_API_URL!

export default function ListPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [city, setCity] = useState("Hyderabad")
  const [locality, setLocality] = useState("All")
  const [saleRentFilter, setSaleRentFilter] = useState("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([])

  const buildImageUrl = (img: string) => {
    if (!img) return "/no-image.png"
    if (img.startsWith("http")) return img
    if (img.startsWith("/")) return `${API_BASE}${img}`
    return `${API_BASE}/${img}`
  }

  const formatPrice = (price: number) => {
    if (!price) return 0
    return Number(price)
  }

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(
          `${API_BASE}/properties?page=1&pageSize=100`
        )

        if (!res.ok) throw new Error("Failed to fetch")

        const data = await res.json()

        let raw: any[] = []

        if (Array.isArray(data)) raw = data
        else if (data.items) raw = data.items
        else if (data.data) raw = data.data

        const list = raw.map((p: any) => {
          const imagesRaw = p.images || p.photos || []

          const fixedImages = imagesRaw.map((img: string) =>
            buildImageUrl(img)
          )

          const beds =
            p.beds ??
            p.bedrooms ??
            p.noOfBedrooms ??
            p.bhk ??
            0

          const baths =
            p.baths ??
            p.bathrooms ??
            p.noOfBathrooms ??
            0

          const price =
            p.price ||
            p.amount ||
            p.expectedPrice ||
            0

          return {
            ...p,

            id: p.id || p._id,

            type:
              p.type ||
              p.propertyCategory ||
              p.purpose ||
              "sale",

            city:
              p.city ||
              p.address?.city ||
              "",

            locality:
              p.locality ||
              p.address?.area ||
              "",

            title:
              p.title ||
              p.propertyTitle ||
              p.projectName ||
              "Property",

            price: formatPrice(price),

            beds,
            baths,

            address:
              p.address?.fullAddress ||
              p.address?.line1 ||
              `${p.locality || ""} ${p.city || ""}`,

            images: fixedImages.length
              ? fixedImages
              : ["/no-image.png"],
          }
        })

        setProperties(list)
        setFilteredProperties(list)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  useEffect(() => {
    if (isInitialLoad) {
      setFilteredProperties(properties)
      return
    }

    let result = properties

    if (city) {
      result = result.filter(
        p => p.city?.toLowerCase() === city.toLowerCase()
      )
    }

    if (locality !== "All") {
      result = result.filter(
        p => p.locality?.toLowerCase() === locality.toLowerCase()
      )
    }

    if (saleRentFilter !== "all") {
      if (saleRentFilter === "sale") {
        result = result.filter(p => p.type?.startsWith("sale"))
      } else {
        result = result.filter(
          p => p.type === "rent" || p.type === "rental"
        )
      }
    }

    if (saleRentFilter === "sale" && propertyTypeFilter.length > 0) {
      result = result.filter(p =>
        propertyTypeFilter.includes(p.type)
      )
    }

    setFilteredProperties(result)
  }, [
    properties,
    city,
    locality,
    saleRentFilter,
    propertyTypeFilter,
    isInitialLoad,
  ])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ListPageHeader
        city={city}
        locality={locality}
        saleRentFilter={saleRentFilter}
        propertyTypeFilter={propertyTypeFilter}
        onCityChange={setCity}
        onLocalityChange={setLocality}
        onSaleRentChange={setSaleRentFilter}
        onPropertyTypeChange={setPropertyTypeFilter}
      />

      <main className="flex-grow container mx-auto py-6 px-4 pb-28">
        {isLoading ? (
          <div className="text-center text-gray-500">
            Loading properties...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        generatePropertyPopupContent(property),
                    }}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <h2 className="text-xl font-semibold">
                  No properties found
                </h2>
                <p>
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}