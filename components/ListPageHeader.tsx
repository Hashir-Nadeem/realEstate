"use client"

import Image from "next/image"
import Link from "next/link"
import { Filter } from "lucide-react"
import { useCityLocality } from "@/hooks/useCityLocality"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"

interface ListPageHeaderProps {
  city: string
  locality: string
  saleRentFilter: string
  propertyTypeFilter: string[]
  onCityChange: (city: string) => void
  onLocalityChange: (locality: string) => void
  onSaleRentChange: (value: string) => void
  onPropertyTypeChange: (types: string[]) => void
}

export const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  city,
  locality,
  saleRentFilter,
  propertyTypeFilter,
  onCityChange,
  onLocalityChange,
  onSaleRentChange,
  onPropertyTypeChange,
}) => {
  const { cities, availableLocalities, handleCityChange: updateLocalities } = useCityLocality()

  useEffect(() => {
    if (city) {
      updateLocalities(city)
    }
  }, [city, updateLocalities])

  const handleCitySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value
    onCityChange(newCity)
    onLocalityChange("All") // Reset locality when city changes
    updateLocalities(newCity)
  }

  const handlePropertyTypeToggle = (type: string) => {
    const newTypes = propertyTypeFilter.includes(type)
      ? propertyTypeFilter.filter(t => t !== type)
      : [...propertyTypeFilter, type]
    onPropertyTypeChange(newTypes)
  }

  const propertyTypes = [
    { id: "sale-residential", label: "Residential" },
    { id: "sale-luxury", label: "Luxury" },
    { id: "sale-commercial", label: "Commercial" },
  ]

  return (
    <header className="sticky top-0 z-20 bg-red-600 shadow-md p-3">
      <div className="container mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image 
              src="/placeholder-logo.png" alt="Laksmiland Logo" width={150} height={40} className="object-contain" />
        </Link>

        {/* Search and Filters */}
        <div className="flex-grow flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
          {/* City Dropdown */}
          <select
            value={city}
            onChange={handleCitySelection}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Locality Dropdown */}
          <select
            value={locality}
            onChange={(e) => onLocalityChange(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={availableLocalities.length === 0}
          >
            <option value="All">All Localities</option>
            {availableLocalities.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Listing Type</h4>
                  <select
                    value={saleRentFilter}
                    onChange={(e) => onSaleRentChange(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="sale">For Sale</option>
                    <option value="rental">For Rent</option>
                  </select>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Property Type (Sale)</h4>
                  <div className="space-y-2">
                    {propertyTypes.map(type => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={propertyTypeFilter.includes(type.id)}
                          onCheckedChange={() => handlePropertyTypeToggle(type.id)}
                        />
                        <Label htmlFor={type.id} className="text-sm font-normal">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Post Property Button */}
        <Link href="/" passHref>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 whitespace-nowrap">
            Post Property <span className="ml-1 bg-white text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-sm">FREE</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
