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
          <Link href={`/help/cities`} className="group">
  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
    
    {/* Image Section */}
    <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop" 
        alt="City property FAQs"
        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
      />
      <div className="absolute inset-0 bg-purple-900/10"></div>
    </div>
    
    {/* Content */}
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
        City-wise FAQs
      </h3>
      
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Property trends in cities
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Area-specific buying guidance
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Legal & documentation FAQs
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Investment tips by city
          </span>
        </li>
      </ul>
    </div>

  </div>
          </Link>
         {/*
<Link href={`/faqs${city ? `?city=${city}` : ""}`} className="group">
  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
    
    <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop" 
        alt="City property FAQs"
        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
      />
      <div className="absolute inset-0 bg-purple-900/10"></div>
    </div>
    
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
        City-wise FAQs
      </h3>
      
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Property trends in {city || "your city"}
          </span>
        </li>

        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Area-specific buying guidance
          </span>
        </li>

        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Legal & documentation FAQs
          </span>
        </li>

        <li className="flex items-start">
          <span className="text-gray-400 mr-2">•</span>
          <span className="text-sm">
            Investment tips by city
          </span>
        </li>
      </ul>
    </div>

  </div>
</Link>
*/}

        </div>
      </div>
    </div>
  )
}
