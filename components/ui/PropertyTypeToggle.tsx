"use client"

import { useState } from "react"

interface PropertyTypeToggleProps {
  showSale: boolean
  showRental: boolean
  onSaleToggle: (show: boolean) => void
  onRentalToggle: (show: boolean) => void
}

export const PropertyTypeToggle: React.FC<PropertyTypeToggleProps> = ({
  showSale,
  showRental,
  onSaleToggle,
  onRentalToggle,
}) => {
  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <div className="flex flex-col w-12 rounded-full shadow-lg overflow-hidden border border-gray-200 bg-white">
        {/* Sale Button */}
        <button
          onClick={() => onSaleToggle(!showSale)}
          className={`py-5 text-sm font-medium transition-all duration-200 ${
            showSale
              ? "bg-red-500 text-white"
              : "bg-gray-500 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sale
        </button>
        
        {/* Rental Button */}
        <button
          onClick={() => onRentalToggle(!showRental)}
          className={`py-5 text-sm font-medium transition-all duration-200 ${
            showRental
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Rent
        </button>
      </div>

      {/* Sale Types Legend - only show when sale is enabled */}
      {showSale && (
        <div className="mt-3 bg-white rounded-lg shadow-lg p-3 border border-gray-200 w-32">
          <div className="text-xs font-medium mb-2 text-gray-600">Sale Types:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs">Residential</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs">Luxury</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs">Commercial</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
