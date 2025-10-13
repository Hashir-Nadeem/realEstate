"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PropertyDetailsPage() {
  const params = useParams()
  const propertyId = params.id

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <Link href="/">
          <button className="mr-3 mt-2 bg-transparent border-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl text-black">Property Details</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center">Property Details Page</h1>
        <p className="text-center text-gray-600 mt-4">
          Property ID: {propertyId}
        </p>
      </div>
    </div>
  )
}
