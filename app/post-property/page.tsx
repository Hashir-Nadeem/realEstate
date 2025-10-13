"use client"

// React and Next.js imports
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Camera, Video, User, MapPin, Home, PhoneOutgoing, Image, FileImage, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useMapViewState } from "@/hooks/useMapViewState"

const MapSelector = dynamic(() => import("@/components/map-selector"), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
})

export default function PostPropertyPage() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  // Use the geolocation hook
  const { 
    userLocation, 
    isLocating, 
    locationError, 
    getCurrentLocation,
    clearError 
  } = useGeolocation()

  // Use the map view state hook
  const {
    isViewingCurrentLocation,
    setIsViewingCurrentLocation,
  } = useMapViewState(userLocation)
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false)
  const propertyTypeRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    // Basic Property Details
    propertyCategory: "",
    transactionType: "",
    youAreHereTo: "",
    title: "",
    description: "",
    price: "",
    priceUnit: "lac",
    area: "",
    areaUnit: "sqft",
    bedrooms: "",  
    bathrooms: "",  
    
    // Property Specifications
    facing: "",
    floorNumber: "",
    totalFloors: "",

    // Location Details
    fullAddress: "",
    city: "",
    locality: "",

    // Contact Information
    contactPersonName: "",
    email: "",
    whatsapp: "",

    // Media Links
    youtubeLink: "",
    tourLink: "",
    videoCategory: "",

    // User Type
    youAre: "",

    // Photos
    photos: [] as File[],
  })

  // Property type categories
  const propertyTypes = {
    "ALL RESIDENTIAL": [
      { value: "flat-apartment", label: "Flat/Apartment" },
      { value: "residential-house", label: "Residential House" },
      { value: "villa", label: "Villa" },
      { value: "independent-house", label: "Independent House" },
      { value: "residential-plot", label: "Residential Plot" }
    ],
    "ALL COMMERCIAL": [
      { value: "commercial-office", label: "Commercial Office" },
      { value: "commercial-shop", label: "Commercial Shop" },
      { value: "warehouse", label: "Warehouse" },
    ],
    "OTHERS": [
      { value: "agricultural-land", label: "Agricultural Land" }
    ]
  }
  
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (propertyTypeRef.current && !propertyTypeRef.current.contains(event.target as Node)) {
        setIsPropertyTypeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [propertyTypeRef]);



  // Initialize location on app start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getCurrentLocation(true)
        .then((location) => {
          setSelectedLocation(location)
          setIsViewingCurrentLocation(true)
        })
        .catch((error) => {
          console.error("Failed to get initial location:", error)
          const defaultLocation = { lat: 12.9716, lng: 77.5946 }
          setSelectedLocation(defaultLocation)
          setIsViewingCurrentLocation(false)
        })
    }
  }, [getCurrentLocation, setIsViewingCurrentLocation])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePropertyTypeSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, propertyCategory: value }))
    setIsPropertyTypeOpen(false)
  }

  const getSelectedPropertyTypeLabel = () => {
    for (const category of Object.keys(propertyTypes)) {
      const found = propertyTypes[category as keyof typeof propertyTypes].find(
        item => item.value === formData.propertyCategory
      )
      if (found) return found.label
    }
    return ""
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData, selectedLocation)
  }

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location)
  }

  const handleMapViewChange = (viewingCurrentLocation: boolean) => {
    // Only update if the state is actually different
    if (viewingCurrentLocation !== isViewingCurrentLocation) {
      setIsViewingCurrentLocation(viewingCurrentLocation);
    }
  }

  // Set default values for dropdowns after component mounts to avoid hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        bedrooms: prev.bedrooms || "2",
        bathrooms: prev.bathrooms || "2"
      }))
    }
  }, [])

  return (
    <div className="property-page-container">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <Link href="/">
          <button className="mr-3 mt-2 bg-transparent border-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl text-black">Post property Ad for Free!</h1>
      </div>

      <div className="property-form-container">
        <form onSubmit={handleSubmit}>
          {/* Location Selector */}
          <div className="form-section"> 
            <div>
              <div className="text-sm font-medium -mt-4">
                Are you at the center of the property to post Ad?
                <span className="text-red-500 ml-1">*</span>
              </div>

              {/* Location Status */}
              {isLocating && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-800">Getting your precise location...</p>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                  <p className="text-sm text-yellow-800">{locationError}</p>
                </div>
              )}

              {userLocation?.accuracy && userLocation.accuracy < 200 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                  <p className="text-sm text-green-800">
                    Location accuracy: ±{Math.round(userLocation.accuracy)}m
                    {userLocation.accuracy < 50 && " (Excellent)"}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4 mb-4">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-full ${
                    selectedLocation && userLocation
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {selectedLocation && userLocation ? "Yes - Location Set" : "Yes"}
                </button>
                <button type="button" className="py-2 px-4 rounded-full border border-gray-300">
                  No
                </button>
              </div>

              <MapSelector 
                onLocationSelect={handleLocationSelect} 
                userLocation={userLocation} 
              />
            </div>

            <div className="mt-8">
                <div className="text-xl font-medium mb-2">
                  You are looking to <span className="text-red-500">*</span>
                </div>
                <div className="radio-group grid-cols-2">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="sell" 
                      name="youAreHereTo" 
                      value="sell"
                      checked={formData.youAreHereTo === "sell"}
                      onChange={(e) => handleInputChange("youAreHereTo", e.target.value)}
                    />
                    <label htmlFor="sell">Sell</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="rent" 
                      name="youAreHereTo" 
                      value="rent"
                      checked={formData.youAreHereTo === "rent"}
                      onChange={(e) => handleInputChange("youAreHereTo", e.target.value)}
                    />
                    <label htmlFor="rent">Rent / Lease</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 -mt-6">
              <div className="w-4/5 txt_field">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
                <span></span>
                <label>Price</label>
              </div>
              <div className="w-1/5 flex items-end pb-8">
                <select
                  value={formData.priceUnit}
                  onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="lac">Lac</option>
                  <option value="crore">Cr</option>
                  <option value="thousand">Thousand</option>
                </select>
              </div>
            </div>

              <div className="-mt-6">
            {/* Custom Property Type Dropdown */}
            <div className="select-box" ref={propertyTypeRef}>
              <div 
                className={`custom-dropdown-header border-b border-gray-300 py-2 px-1 flex justify-between items-center cursor-pointer selected`}
                onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
              >
                <div className="flex flex-col text-sm">
                  <span className={`${formData.propertyCategory ? "text-black" : "text-gray-400"} mt-1`}>
                    {getSelectedPropertyTypeLabel() || "Select Property Type"}
                  </span>
                </div>
                {isPropertyTypeOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              
              <div className={`options-container ${isPropertyTypeOpen ? 'active' : ''}`}>
                {Object.entries(propertyTypes).map(([category, options]) => (
                  <div key={category} className="dropdown-category">
                    <div className="text-sm py-2 px-4 bg-gray-500 text-white font-medium">
                      {category}
                    </div>
                    {options.map(option => (
                      <div 
                        key={option.value}
                        className="option py-3 text-sm px-4 hover:bg-gray-100 bg-white cursor-pointer"
                        onClick={() => handlePropertyTypeSelect(option.value)}
                      >
                        <label>{option.label}</label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="txt_field mt-8">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
              <span></span>
              <label>Property Title</label>
            </div>


            <div className="flex gap-4 -mt-8">
              <div className="w-4/5 txt_field">
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  required
                />
                <span></span>
                <label>Area</label>
              </div>
              <div className="w-1/5 flex items-end pb-8">
                <select
                  value={formData.areaUnit}
                  onChange={(e) => handleInputChange("areaUnit", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="sqft">SFT</option>
                  <option value="sqyard">Sq Yard</option>
                  <option value="sqmeter">Sq Meter</option>
                  <option value="acres">Acres</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="" disabled>Beds</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4+">4+ Bedrooms</option>
                  <option value="0">None</option>
                </select>
              </div>
              <div>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="" disabled>Baths</option>
                  <option value="1">1 Bath</option>
                  <option value="2">2 Baths</option>
                  <option value="3">3 Baths</option>
                  <option value="4+">4+ Baths</option>
                  <option value="0">None</option>
                </select>
              </div>
              <div>
                <select
                  value={formData.facing}
                  onChange={(e) => handleInputChange("facing", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="" disabled>Facing</option>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-5 mt-8">
              <span>Floor</span>
              <div className="w-1/4">
                <select
                  value={formData.floorNumber}
                  onChange={(e) => handleInputChange("floorNumber", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="" disabled>Floor</option>
                  <option value="0">Ground</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <span>Out of</span>
              <div className="w-1/4">
                <select
                  value={formData.totalFloors}
                  onChange={(e) => handleInputChange("totalFloors", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                >
                  <option value="" disabled>Total</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6+</option>
                </select>
              </div>
              <span>Floors</span>
            </div>
          </div>
            

            <div className="txt_field">
              <input
                type="text"
                value={formData.fullAddress}
                onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                required
              />
              <span></span>
              <label>Address</label>
            </div>

            <div className="grid grid-cols-2 gap-4 -mt-8">
              <div className="txt_field">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
                <span></span>
                <label>City</label>
              </div>
              <div className="txt_field">
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => handleInputChange("locality", e.target.value)}
                  required
                />
                <span></span>
                <label>Locality</label>
              </div>
            </div>

            <div className="-mt-8">
              <div className="txt_field">
                <input
                  type="text"
                  value={formData.youtubeLink}
                  onChange={(e) => handleInputChange("youtubeLink", e.target.value)}
                />
                <span></span>
                <label>YouTube Link</label>
              </div>

              <div className="txt_field">
                <input
                  type="text"
                  value={formData.tourLink}
                  onChange={(e) => handleInputChange("tourLink", e.target.value)}
                />
                <span></span>
                <label>3D Tour Link</label>
              </div>
                          <div className="mt-6">
              <label className="text-sm font-medium">Property Description</label>
              <textarea
                className="w-full border rounded-md p-3 mt-2 bg-[#F9FAFB]"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your property features, amenities, nearby facilities..."
              ></textarea>
            </div>
            
          <div className="mt-8">
                <div className="text-xl font-medium mb-2">
                  You are <span className="text-red-500">*</span>
                </div>
                <div className="radio-group">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="owner" 
                      name="youAre" 
                      value="owner"
                      checked={formData.youAre === "owner"}
                      onChange={(e) => handleInputChange("youAre", e.target.value)}
                    />
                    <label htmlFor="owner">Owner</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="agent" 
                      name="youAre" 
                      value="agent"
                      checked={formData.youAre === "agent"}
                      onChange={(e) => handleInputChange("youAre", e.target.value)}
                    />
                    <label htmlFor="agent">Agent</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="builder" 
                      name="youAre" 
                      value="builder"
                      checked={formData.youAre === "builder"}
                      onChange={(e) => handleInputChange("youAre", e.target.value)}
                    />
                    <label htmlFor="builder">Builder</label>
                  </div>
                </div>
              </div>
              <div className="txt_field">
                <input
                  type="text"
                  value={formData.contactPersonName}
                  onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                  required
                />
                <span></span>
                <label>Contact Person Name</label>
            </div>

            <div className="txt_field">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
              <span></span>
              <label>Email Address</label>
            </div>

            <div>
              <h3 className="mb-2">Your WhatsApp Number</h3>
              <div className="flex">
                <div className="w-1/5 min-w-[90px] max-w-[100px]">
                  <select className="phone-select rounded-l-lg w-full">
                    <option value="IN">🇮🇳 +91</option>
                    <option value="US">🇺🇸 +1</option>
                    <option value="UK">🇬🇧 +44</option>
                    <option value="AE">🇦🇪 +971</option>
                  </select>
                </div>
                <input
                  type="tel"
                  className="p-2 border border-l-0 rounded-r-lg w-4/5"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  required
                />
              </div>
            </div>
            </div>
          </div>

          {/* Photos */}
          <div className="form-section">
            <h2 className="section-title">
              Photos
            </h2>
            <p className="text-md text-black mb-6">
              It's Optional! But, don't forget to upload them later.
            </p>

          <div className="bg-[#FFF6DA] p-4 rounded-full flex border border-yellow-200">
            <div className="w-1/4 flex items-center justify-center">
              <img 
                src="/images/steps/C02B0E15-2F5B-4499-BD70-E4EB313CF76C_4_5005_c.jpeg" 
                alt="" 
                className="w-24 h-24 object-contain " 
              />
            </div>
            <div className="ml-4 my-2">
              <h3 className="text-xl">85% of <span className="text-red-500 font-normal">Buyers</span> enquire on Properties with Photos</h3>
              <p className="text-xl font-extralight">Upload Photos & Get upto <span className="text-red-500 font-normal">10X more Enquiries</span></p>
            </div>
          </div>

            <div className="upload-area">
              <h3 className="text-3xl text-black font-medium mb-2">Upload your file</h3>
              <p className="text-gray-500 mb-12">File should be an image</p>
              
              <div className="upload-area__drop-zoon my-12">
                <span className="text-4xl text-blue-500">
                  <FileImage className="w-10 h-10" />
                </span>
                <p className="text-gray-400 mt-2">Add Photos Now</p>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  id="photo-upload"
                  className="hidden"
                />
              </div>
              
              {formData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg border overflow-hidden">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button type="submit" className="submit-btn">
              Login & Post Property
            </button>
          </div>

          {/* Process Steps */}
          <div className="steps-container">
            <div className="step-item">
              <div className="step-image">
                <img src="/images/steps/undraw_experience_design_re_dmqq.svg" alt="Step 1" className="w-full" />
              </div>
              <div className="step-content">
                <h3 className="step-title">Step 1:</h3>
                <h4 className="text-2xl mb-2">Walk to the center of the property you want to sell/rent</h4>
                <p className="step-description">This is very important as we place the property location on map</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-image">
                <img src="/images/steps/undraw_messenger_re_8bky.svg" alt="Step 2" className="w-full" />
              </div>
              <div className="step-content">
                <h3 className="step-title">Step 2:</h3>
                <h4 className="text-2xl mb-2">Post your Property Ad</h4>
                <p className="step-description">Enter all details like locality name, amenities along with uploading Photos</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-image">
                <img src="/images/steps/undraw_online_test_re_kyfx (1).svg" alt="Step 3" className="w-full" />
              </div>
              <div className="step-content">
                <h3 className="step-title">Step 3:</h3>
                <h4 className="text-2xl mb-2">Receive calls from Buyer/tenant</h4>
                <p className="step-description">Get access to Buyer/Tenant contact details & connect easily</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-image">
                <img src="/images/steps/undraw_undraw_undraw_search_engines_041x_-2-_cl95_fiwb.svg" alt="Step 4" className="w-full" />
              </div>
              <div className="step-content">
                <h3 className="step-title">Step 4:</h3>
                <h4 className="text-2xl mb-2">Sell/Rent faster with instant Connect</h4>
                <p className="step-description">Negotiate with your prospective Buyer/Tenant & mutually close the deal (site-visit)</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;500&family=Poppins:wght@100;200;300;400&display=swap');

        /* Base styles */
        .property-page-container {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        .property-form-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          border-radius: 10px;
          padding: 2rem;
        }

        .form-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 500;
          color: black;
        }

        /* Text field styling */
        .txt_field {
          position: relative;
          margin: 30px 0;
        }

        .txt_field input,
        .txt_field select {
          width: 100%;
          padding: 0 5px;
          height: 40px;
          font-size: 14px;
          border: none;
          border-bottom: 1px solid black;
          background: none;
          outline: none;
        }

        select {
          font-size: 14px;
          color: #333;
          background: #F9FAFB;
          border: none;
          border-radius: 0px !important;
          border-bottom: 1px solid black; !important;
          padding: 0 5px;
          height: 40px;
        }

        .phone-select {
          background-color: white !important;
          border-radius: 0px !important;
          border-bottom: 1px solid black; !important;
          padding: 10px;
          height: 45px;
        }
        
        .txt_field input:focus,
        .txt_field select :hover {
          border-color: #3620ffff;
        }

        .txt_field label {
          position: absolute;
          top: 50%;
          left: 5px;
          color: #adadad;
          transform: translateY(-50%);
          font-size: 14px;
          pointer-events: none;
          transition: .5s;
        }

        .txt_field span::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 0;
          width: 0%;
          height: 1px;
        }
          
        .txt_field input:not([value=""]):not(:focus) ~ label,
        .txt_field input:focus ~ label,
        .txt_field input:required:valid ~ label,
        .txt_field select:focus ~ label,
        .txt_field select:required:valid ~ label {
          top: -5px;
          color: #2691d9;
        }
        .txt_field input:focus ~ span::before,
        .txt_field input:valid ~ span::before,
        .txt_field select:focus ~ span::before,
        .txt_field select:valid ~ span::before {
          width: 100%;
        }

        /* Button styling */
        .submit-btn {
          width: 256px;
          height: 68px;
          border: 1px solid;
          background: #D02602;
          border-radius: 8px;
          font-size: 1.25rem;
          line-height: 1.75rem;
          color: white;
          font-weight: 400;
          cursor: pointer;
          outline: none;
          margin: 0px 0;
          margin-bottom: 30px;
        }

        .submit-btn:hover {
          border-color: #D02602;
          transition: .5s;
        }

        /* Radio group styling */
        .radio-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }

        .radio-group.grid-cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .radio-option {
          position: relative;
        }

        .radio-option input {
          position: absolute;
          opacity: 0;
        }

        .radio-option label {
          display: block;
          position: relative;
          padding: 15px 10px;
          text-align: center;
          border-radius: 25px;
          border: 1px solid #ccc;
          cursor: pointer;
          transition: all 0.3s;
        }

        .radio-option input:checked + label {
          background-color: #e6f2ff;
          border-color: #2691d9;
          color: #2691d9;
        }

        /* Upload area styling */
        .upload-area {
          width: 100%;
          background-color: white;
          box-shadow: 0 10px 60px rgb(218, 229, 255);
          border: 2px solid #abbcff;
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          margin: 20px 0;
        }

        .upload-area__drop-zoon {
          position: relative;
          height: 180px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          border: 2px dashed #abbcff;
          border-radius: 15px;
          margin-top: 30px;
          cursor: pointer;
          transition: border-color 300ms ease-in-out;
        }

        .upload-area__drop-zoon:hover {
          border-color: #3f86ff;
        }

        /* Steps section styling */
        .steps-container {
          margin-top: 40px;
        }

        .step-item {
          display: flex;
          margin-bottom: 30px;
        }

        .step-image {
          width: 50%;
        }

        .step-content {
          width: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 20px;
        }

        .step-title {
          font-size: 22px;
          margin-bottom: 10px;
        }

        .step-description {
          font-size: 16px;
          font-weight: 300;
        }

        @keyframes progressMove {
          from {
            width: 0%;
            background-color: transparent;
          }

          to {
            width: 100%;
            background-color: #3f86ff;
          }
        }

        .uploaded-file__name {
          width: 100%;
          max-width: 6.25rem;
          display: inline-block;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .uploaded-file__counter {
          font-size: 1rem;
          color: #c4c3c4;
        }

        /* Custom dropdown styling based on your CSS */
        .select-box {
          position: relative;
          width: 100%;
          margin: 30px 0;
        }

        input[type="tel"] {
          background-color: white !important;
          border: none !important;
          border-bottom: 1px solid black !important;
          border-radius: 0 0px 0px 0 !important;
          font-size: 16px !important; /* Prevents iOS zoom */
          height: 45px !important; /* Match phone-select height */
          padding: 0 10px !important;
          margin: 0 !important;
          line-height: normal !important;
          box-shadow: none !important;
        }

        input[type="tel"]:focus {
          outline: none !important;
          border-color: black !important;
        }

        .phone-select:focus {
          outline: none !important;
          border-color: black !important;
        }

        .options-container {
          background: #e4e6e6;
          color: #1b1b1b;
          max-height: 0;
          width: 100%;
          opacity: 0;
          transition: all 0.4s;
          border-radius: 8px;
          overflow: hidden;
          order: 1;
          margin-top: -1px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .selected {
          margin-bottom: 8px;
          position: relative;
          order: 0;
        }

        .options-container.active {
          max-height: 240px;
          opacity: 1;
          overflow-y: auto;
          z-index: 100;
        }

        .options-container::-webkit-scrollbar {
          width: 8px;
          background: #c2c9d3;
          border-radius: 0 8px 8px 0;
        }

        .options-container::-webkit-scrollbar-thumb {
          background: #525861;
          border-radius: 0 8px 8px 0;
        }

        .option {
          padding: 12px 24px;
          cursor: pointer;
        }

        .option:hover {
          background: #becee1;
        }

        .dropdown-category:not(:last-child) {
          margin-bottom: 1px;
        }

/* iOS Safari Dropdown Specific Fixes */

@supports (-webkit-touch-callout: none) {

/* Fix phone number field styling for iOS */
  input[type="text"],
  input[type="number"],
  input[type="email"],
  input[type="password"] {
    -webkit-appearance: none !important;
    appearance: none !important;
    background-color: white !important;
    border:none;
    border-bottom: 1px solid black !important;
    border-radius: 0 0px 0px 0 !important;
    font-size: 16px !important; /* Prevents iOS zoom */
    height: 45px !important; /* Match phone-select height */
    padding: 0 10px !important;
    margin: 0 !important;
    line-height: normal !important;
    box-shadow: none !important;
  }

  input[type="tel"] {
    -webkit-appearance: none !important;
    appearance: none !important;
    background-color: white !important;
    border: none !important;
    border-bottom: 1px solid black !important;
    border-radius: 0 0px 0px 0 !important;
    font-size: 16px !important; /* Prevents iOS zoom */
    height: 45px !important; /* Match phone-select height */
    padding: 0 10px !important;
    margin: 0 !important;
    line-height: normal !important;
    box-shadow: none !important;
  }
  
  /* Fix the flex container for the phone field */
  .flex:has(input[type="tel"]) {
    display: flex !important;
    align-items: stretch !important;
    height: 45px !important;
  }

  /* Common fixes for all select elements */
  select {
    -webkit-appearance: none;
    appearance: none;
    background-color: #F9FAFB !important;
    color: #333 !important;
    border: none !important;
    border-bottom: 1px solid black !important;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 8px center !important;
    padding-right: 24px !important;
    border-radius: 0px !important;
    font-size: 14px !important; /* Match Android */
    height: 40px !important;
    box-shadow: none !important;
  }
  
  /* Fix option colors for iOS */
  select option {
    background-color: white !important;
    color: #333 !important;
  }
  
  /* Fix border alignment between select and input */
  .phone-select {
    border-right-width: 1px !important;
    margin-right: 0 !important;
    padding-left: 8px !important;
    text-align: left !important;
    font-size: 16px !important;
    background-color: white !important;
  }
  
  /* Add vertical alignment fix */
  .w-1/5:has(.phone-select) {
    display: flex !important;
    align-items: stretch !important;
    background-color: white !important;
  }
  
  /* Fix emoji display in phone-select */
  .phone-select option {
    font-size: 16px !important;
  }
  
  /* Fix for iOS focus states */
  input[type="tel"]:focus {
    outline: none !important;
    border-color: #ccc !important;
  }
  
  /* Fix for when the input has content */
  input[type="tel"]:not(:placeholder-shown) {
    border-color: #ccc !important;
  }
}
  
  /* Custom property type dropdown fixes */
  .custom-dropdown-header {
    background-color: transparent !important;
    border-bottom: 1px solid black !important;
    padding-bottom: 8px !important;
    margin-bottom: 0 !important;
  }
  
  /* Fix dropdown positioning and behavior */
  .options-container {
    -webkit-overflow-scrolling: touch;
    background-color: #e4e6e6 !important;
    border-radius: 8px !important;
    transition: max-height 0.4s ease, opacity 0.3s ease !important;
    transform: translateZ(0); /* Hardware acceleration */
    will-change: max-height, opacity;
    max-height: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
  }
  
  .options-container.active {
    position: absolute !important;
    z-index: 1000 !important;
    max-height: 240px !important;
    opacity: 1 !important;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15) !important;
    overflow-y: auto !important;
  }
  
  /* Style the category headers */
  .dropdown-category .text-sm {
    background-color: #6B7280 !important; /* Match Android gray-500 */
    color: white !important;
    font-weight: 500 !important;
    padding: 8px 16px !important;
  }
  
  /* Style the options */
  .option {
    background-color: white !important;
    color: #111827 !important; /* Match Android text color */
    padding: 12px 16px !important;
    border-bottom: 1px solid #F3F4F6 !important;
    transition: background-color 0.2s ease !important;
  }
  
  .option:active,
  .option:hover {
    background-color: #EFF6FF !important; /* Match Android hover color */
  }
  
  /* Fix scrollbar for dropdown */
  .options-container::-webkit-scrollbar {
    width: 8px !important;
    background: #E5E7EB !important; /* Match Android scrollbar track */
  }
  
  .options-container::-webkit-scrollbar-thumb {
    background: #6B7280 !important; /* Match Android scrollbar thumb */
    border-radius: 4px !important;
  }
  
  /* Make sure dropdown triggers and select elements behave consistently */
  .select-box,
  select,
  .phone-select {
    cursor: pointer !important;
  }
  
  /* Fix z-index issues with dropdown */
  .select-box {
    z-index: 10 !important;
    position: relative !important;
  }
  
  /* Fix chevron icon alignment */
  .custom-dropdown-header svg {
    color: #6B7280 !important; /* Match Android icon color */
    min-width: 20px !important;
    min-height: 20px !important;
  }
}
      `}</style>
    </div>
  )
}