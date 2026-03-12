"use client"

import { useState } from "react"
import { Bath, Bed, Ruler, MapPin, Layers, Compass } from "lucide-react"
import ContactOwnerDialog from "./ContactOwnerDialog"

const PropertyDetailWidget = ({ property }: any) => {
  const [open, setOpen] = useState(false)

  return (
    <div>

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>

        <div className="text-3xl font-extrabold text-red-600 mt-2">
          ₹ {property.price} {property.priceUnit}
        </div>

        <div className="flex items-center text-gray-500 mt-2 text-sm">
          <MapPin size={16} className="mr-1" />
          {property.address}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-5 mb-6">

        <Highlight icon={<Ruler />} label="Area" value={property.area} />
        <Highlight icon={<Bed />} label="Beds" value={property.beds} />
        <Highlight icon={<Bath />} label="Baths" value={property.baths} />

        {property.facing && (
          <Highlight icon={<Compass />} label="Facing" value={property.facing} />
        )}

        {property.floorNumber && property.totalFloors && (
          <Highlight
            icon={<Layers />}
            label="Floor"
            value={`${property.floorNumber} / ${property.totalFloors}`}
          />
        )}

      </div>

      {property.description && (
        <p className="text-gray-600 mb-6 leading-relaxed">
          {property.description}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setOpen(true)}
          className="flex-1 bg-red-600 text-white py-3 rounded-full font-semibold"
        >
          Contact Owner
        </button>

        <button
          onClick={() => setOpen(true)}
          className="flex-1 border border-red-600 text-red-600 py-3 rounded-full font-semibold"
        >
          Get Phone
        </button>
      </div>

      <ContactOwnerDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        ownerContact={property.whatsapp}
        propertyId={property.id}
      />

    </div>
  )
}

const Highlight = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3">
    <div className="bg-red-50 text-red-600 p-2 rounded-lg">{icon}</div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
)

export default PropertyDetailWidget