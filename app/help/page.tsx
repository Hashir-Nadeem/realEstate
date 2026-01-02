"use client"

import React from 'react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">Help & Support</h1>
          <p className="text-sm md:text-base text-gray-600 text-center">Find answers to your questions about buying, selling, and renting properties</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <Link href="/help/buy" className="group">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop" 
                  alt="Modern house for buying"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-blue-900/10"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  Buy
                </h3>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Find your dream property</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Document verification support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Home loan assistance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Complete ownership transfer</span>
                  </li>
                </ul>
              </div>
            </div>
          </Link>

          <Link href="/help/rent" className="group">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1200&auto=format&fit=crop" 
                  alt="Apartment building for rent"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-green-900/10"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  Rent
                </h3>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">List your rental property</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Free property posting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Connect with tenants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Rental agreement support</span>
                  </li>
                </ul>
              </div>
            </div>
          </Link>

          <Link href="/help/sell" className="group">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop" 
                  alt="Beautiful home for sale"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-red-900/10"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
                  Sell
                </h3>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">List your property for free</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Upload photos and details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Connect with buyers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span className="text-sm">Get market value insights</span>
                  </li>
                </ul>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
