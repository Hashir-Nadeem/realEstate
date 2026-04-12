"use client"

// React and Next.js imports
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Camera, Video, User, MapPin, Home, PhoneOutgoing, Image, FileImage, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useMapViewState } from "@/hooks/useMapViewState"
import { useCityLocality } from "@/hooks/useCityLocality"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest } from "@/lib/api"

const MapSelector = dynamic(() => import("@/components/map-selector"), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
})

export default function PostPropertyPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isFormEnabled, setIsFormEnabled] = useState(false) // Track form enabled/disabled state
  
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

  // Use city-locality hook with auto-selection of nearest city
  const {
    selectedCity,
    selectedLocality,
    availableLocalities,
    cities,
    handleCityChange,
    handleLocalityChange,
  } = useCityLocality({ 
    userLocation, 
    autoSetNearestCity: true 
  })

  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false)
  const propertyTypeRef = useRef<HTMLDivElement>(null)
  
  // Custom city/locality state
  const [useCustomLocation, setUseCustomLocation] = useState(false)
  
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
    customCity: "",
    customLocality: "",

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

  // submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  // Property type categories - Updated to match attached image
  const propertyTypes = {
    "ALL RESIDENTIAL": [
      { value: "flat-apartment", label: "Flat/ Apartment" },
      { value: "residential-house", label: "Residential House" },
      { value: "villa", label: "Villa" },
      { value: "builder-floor-apartment", label: "Builder Floor Apartment" },
      { value: "residential-land-plot", label: "Residential Land/ Plot" },
      { value: "penthouse", label: "Penthouse" },
      { value: "studio-apartment", label: "Studio Apartment" }
    ],
    "ALL COMMERCIAL": [
      { value: "commercial-office-space", label: "Commercial Office Space" },
      { value: "office-in-it-park-sez", label: "Office in IT Park/ SEZ" },
      { value: "commercial-shop", label: "Commercial Shop" },
      { value: "commercial-showroom", label: "Commercial Showroom" },
      { value: "commercial-land", label: "Commercial Land" },
      { value: "warehouse-godown", label: "Warehouse/ Godown" },
      { value: "industrial-land", label: "Industrial Land" },
      { value: "industrial-building", label: "Industrial Building" }
    ],
    "ALL AGRICULTURAL": [
      { value: "agricultural-land", label: "Agricultural Land" },
      { value: "farm-house", label: "Farm House" }
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
    
    // Handle city change to populate localities
    if (field === 'city') {
      handleCityChange(value)
    } else if (field === 'locality') {
      handleLocalityChange(value)
    }
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

  const MAX_PHOTOS = 6; // Maximum number of photos allowed

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => {
      const currentPhotos = prev.photos.length;
      const remainingSlots = MAX_PHOTOS - currentPhotos;
      const photosToAdd = files.slice(0, remainingSlots); // Only add up to the remaining slots
      return { ...prev, photos: [...prev.photos, ...photosToAdd] };
    });
  }

  const isMobile = useIsMobile()

  const handleCameraCapture = async () => {
    // Check if we're on a mobile device or if the browser supports camera access
    const isMobileDevice = isMobile || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobileDevice) {
      // For mobile devices, use file input with camera capture
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment' // Use back camera on mobile
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || [])
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
      }
      input.click()
    } else {
      // For desktop/laptop, try to access camera via getUserMedia API
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // Fallback to file input if camera API not supported
          handleFileInputFallback()
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment' // Prefer back camera if available
          } 
        })
        
        // Create modal with camera preview
        showCameraModal(stream)
      } catch (error) {
        console.error('Camera access denied or not available:', error)
        // Fallback to file input
        handleFileInputFallback()
      }
    }
  }

  const handleFileInputFallback = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
    }
    input.click()
  }

  const showCameraModal = (stream: MediaStream) => {
    // Create modal overlay
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `

    // Create video element
    const video = document.createElement('video')
    video.style.cssText = `
      width: 80%;
      max-width: 500px;
      height: auto;
      border-radius: 10px;
    `
    video.srcObject = stream
    video.autoplay = true
    video.playsInline = true

    // Create canvas for capture
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Create buttons container
    const buttonsContainer = document.createElement('div')
    buttonsContainer.style.cssText = `
      margin-top: 20px;
      display: flex;
      gap: 20px;
    `

    // Close modal function
    const closeModal = () => {
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop())
      // Remove modal from DOM
      document.body.removeChild(modal)
    }

    // Capture button
    const captureBtn = document.createElement('button')
    captureBtn.textContent = '📷 Capture Photo'
    captureBtn.style.cssText = `
      padding: 12px 24px;
      background: #3B82F6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    `
    captureBtn.onclick = () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      ctx?.drawImage(video, 0, 0)
      
      // Convert canvas to blob and add to photos
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
          setFormData((prev) => ({ ...prev, photos: [...prev.photos, file] }))
        }
      }, 'image/jpeg', 0.9)
      
      // Close modal
      closeModal()
    }

    // Close button
    const closeBtn = document.createElement('button')
    closeBtn.textContent = '❌ Close'
    closeBtn.style.cssText = `
      padding: 12px 24px;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    `
    closeBtn.onclick = closeModal

    // Add elements to modal
    buttonsContainer.appendChild(captureBtn)
    buttonsContainer.appendChild(closeBtn)
    modal.appendChild(video)
    modal.appendChild(buttonsContainer)

    // Add modal to page
    document.body.appendChild(modal)

    // Handle ESC key to close
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
    document.addEventListener('keydown', handleKeyPress)
  }

  const handleGallerySelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setFormData((prev) => {
        const currentPhotos = prev.photos.length;
        const remainingSlots = MAX_PHOTOS - currentPhotos;
        const photosToAdd = files.slice(0, remainingSlots); // Only add up to the remaining slots
        return { ...prev, photos: [...prev.photos, ...photosToAdd] };
      });
    };
    input.click();
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!isAuthenticated) {
    router.push('/login?redirect=/post-property')
    return
  }

  setSubmitMessage(null)
  setIsSubmitting(true)

  // Validation for custom city/locality
  if (useCustomLocation) {
    if (!formData.customCity.trim() || !formData.customLocality.trim()) {
      setSubmitMessage("Please fill in both custom city and locality fields.")
      setIsSubmitting(false)
      return
    }
  } else {
    if (!formData.city || !formData.locality) {
      setSubmitMessage("Please select both city and locality from dropdowns.")
      setIsSubmitting(false)
      return
    }
  }

  try {
    // 1️⃣ Upload images first (if any)
    let uploadedUrls: string[] = []

    if (formData.photos && formData.photos.length > 0) {
      const fd = new FormData()
      formData.photos.forEach((f) => fd.append("photos", f))

      const uploadRes = await fetch("/api/upload-images", {
        method: "POST",
        body: fd,
      })

      if (!uploadRes.ok) {
        throw new Error("Image upload failed")
      }

      const uploadJson = await uploadRes.json()
      uploadedUrls = uploadJson.files || []
    }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;
    // 2️⃣ Prepare payload for .NET API
   const payload = {
  formData: {
    UserId: userId,
    propertyCategory: formData.propertyCategory,
    youAreHereTo: formData.youAreHereTo,
    title: formData.title,
    description: formData.description,

    // 🔥 IMPORTANT: convert to correct numeric types
    price: Number(formData.price),
    priceUnit: formData.priceUnit,

    area: Number(formData.area),
    areaUnit: formData.areaUnit,

    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    facing: formData.facing,
    floorNumber: formData.floorNumber,
    totalFloors: formData.totalFloors,

    fullAddress: formData.fullAddress,
    city: useCustomLocation
      ? formData.customCity
      : formData.city,
    locality: useCustomLocation
      ? formData.customLocality
      : formData.locality,

    contactPersonName: formData.contactPersonName,
    email: formData.email,
    whatsapp: formData.whatsapp,

    uploadedImages: uploadedUrls || [],
  },

  location: selectedLocation
    ? {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }
    : null,

  submittedAt: new Date().toISOString(),
}

    // 3️⃣ Send to .NET backend using apiRequest
    await apiRequest("/properties", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    setSubmitMessage("Property submitted successfully ✅")
    router.push("/")

  } catch (err: any) {
    console.error("Submit error:", err)
    setSubmitMessage(err.message || "Failed to submit property.")
  } finally {
    setIsSubmitting(false)
  }
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

  // Sync form data when city is auto-selected based on user location
  useEffect(() => {
    if (selectedCity && selectedCity !== formData.city && !useCustomLocation) {
      setFormData(prev => ({
        ...prev,
        city: selectedCity,
        locality: '' // Reset locality when city changes
      }))
    }
  }, [selectedCity, formData.city, useCustomLocation])

  // Clear form fields when switching between dropdown and custom inputs
  useEffect(() => {
    if (useCustomLocation) {
      // Clear dropdown values when switching to custom
      setFormData(prev => ({
        ...prev,
        city: '',
        locality: ''
      }))
    } else {
      // Clear custom values when switching to dropdown
      setFormData(prev => ({
        ...prev,
        customCity: '',
        customLocality: ''
      }))
    }
  }, [useCustomLocation])

  const handleEnableForm = (enable: boolean) => {
    setIsFormEnabled(enable)
    if (enable) {
      setFormData(prev => ({
        ...prev,
        youAreHereTo: "rent", // Default to Rent/Lease when enabled
      }))
    }
  }

  return (
    <div className="property-page-container relative flex min-h-screen flex-col">
      {/* Static Background Image */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/page_background.jpeg')", // Use local image
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-indigo-900/40"></div>
        </div>
      </div>

      {/* Header - Fixed at top */}
      <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-3 flex items-center shadow-sm shrink-0">
        <Link href="/">
          <button className="mr-3 mt-2 bg-transparent border-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl text-black">Post property Ad for Free!</h1>
      </header>

      {/* Scrollable Form Container */}
      <main className="relative z-10 flex-1 overflow-y-auto">
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
                  className={`py-2 px-4 rounded-full ${isFormEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "border border-gray-300"}`}
                  onClick={() => handleEnableForm(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 rounded-full ${!isFormEnabled ? "bg-red-600 hover:bg-red-700 text-white" : "border border-gray-300"}`}
                  onClick={() => handleEnableForm(false)}
                >
                  No
                </button>
              </div>

              <MapSelector 
                onLocationSelect={handleLocationSelect} 
                userLocation={userLocation} 
              />
            </div>

            {/* Form Fields */}
            <div className={`mt-8 ${isFormEnabled ? "" : "opacity-50 pointer-events-none"}`}>
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
                    disabled={!isFormEnabled} // Disable when form is not enabled
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
                    disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
                />
                <span></span>
                <label>Price</label>
              </div>
              <div className="w-1/5 flex items-end pb-8">
                <select
                  value={formData.priceUnit}
                  onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                  disabled={!isFormEnabled} // Disable when form is not enabled
                >
                  <option value="lac">Lac</option>
                  <option value="crore">Cr</option>
                  <option value="thousand">Thousand</option>
                </select>
              </div>
            </div>

              <div className="-mt-6">
            {/* Custom Property Type Dropdown */}
            <div className={`select-box ${!isFormEnabled ? "opacity-50 pointer-events-none" : ""}`} ref={propertyTypeRef}>
              <div 
                className={`custom-dropdown-header border-b border-gray-300 py-2 px-1 flex justify-between items-center cursor-pointer ${formData.propertyCategory ? "selected" : ""}`}
                onClick={() => isFormEnabled && setIsPropertyTypeOpen(!isPropertyTypeOpen)}
              >
                <div className="flex flex-col">
                  <span className={`text-sm ${formData.propertyCategory ? "text-blue-600 font-medium" : "text-gray-500"} transition-colors`}>
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
                    <div className="text-sm category-header">
                      {category}
                    </div>
                    {options.map(option => (
                      <div 
                        key={option.value}
                        className="option cursor-pointer"
                        onClick={() => isFormEnabled && handlePropertyTypeSelect(option.value)}
                      >
                        <label className="cursor-pointer w-full block">{option.label}</label>
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
                disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
                />
                <span></span>
                <label>Area</label>
              </div>
              <div className="w-1/5 flex items-end pb-8">
                <select
                  value={formData.areaUnit}
                  onChange={(e) => handleInputChange("areaUnit", e.target.value)}
                  className="border-b border-gray-300 w-full p-2"
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                disabled={!isFormEnabled} // Disable when form is not enabled
              />
              <span></span>
              <label>Address</label>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="txt_field">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  disabled={!isFormEnabled || useCustomLocation} // Disable when form is not enabled or using custom
                >
                  <option value="" disabled>Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <span></span>
              </div>
              <div className="txt_field">
                <select
                  value={formData.locality}
                  onChange={(e) => handleInputChange("locality", e.target.value)}
                  required
                  disabled={!selectedCity || !isFormEnabled || useCustomLocation} // Disable when city is not selected, form is not enabled, or using custom
                >
                  <option value="" disabled>
                    {selectedCity ? "Select Locality" : "Select City First"}
                  </option>
                  {availableLocalities.map((locality) => (
                    <option key={locality} value={locality}>
                      {locality}
                    </option>
                  ))}
                </select>
                <span></span>
              </div>
            </div>

            {/* Custom Location Checkbox */}
            <div className="flex items-center gap-3 mt-6 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useCustomLocation"
                  checked={useCustomLocation}
                  onChange={(e) => setUseCustomLocation(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 flex-shrink-0"
                  disabled={!isFormEnabled}
                />
                <label htmlFor="useCustomLocation" className="ml-2 text-sm text-gray-700 leading-relaxed">
                  Add custom city/locality not in dropdown
                </label>
              </div>
            </div>

            {/* Custom City and Locality Inputs */}
            {useCustomLocation && (
              <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
                <div className="txt_field">
                  <input
                    type="text"
                    value={formData.customCity}
                    onChange={(e) => handleInputChange("customCity", e.target.value)}
                    required={useCustomLocation}
                    disabled={!isFormEnabled}
                    placeholder="Enter custom city"
                  />
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={formData.customLocality}
                    onChange={(e) => handleInputChange("customLocality", e.target.value)}
                    required={useCustomLocation}
                    disabled={!isFormEnabled}
                    placeholder="Enter custom locality"
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="txt_field">
                <input
                  type="text"
                  value={formData.youtubeLink}
                  onChange={(e) => handleInputChange("youtubeLink", e.target.value)}
                  disabled={!isFormEnabled} // Disable when form is not enabled
                />
                <span></span>
                <label>YouTube Link</label>
              </div>

              <div className="txt_field">
                <input
                  type="text"
                  value={formData.tourLink}
                  onChange={(e) => handleInputChange("tourLink", e.target.value)}
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                disabled={!isFormEnabled} // Disable when form is not enabled
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
                      disabled={!isFormEnabled} // Disable when form is not enabled
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
                      disabled={!isFormEnabled} // Disable when form is not enabled
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
                      disabled={!isFormEnabled} // Disable when form is not enabled
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
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
                disabled={!isFormEnabled} // Disable when form is not enabled
              />
              <span></span>
              <label>Email Address</label>
            </div>

            <div>
              <h3 className="mb-2">Your WhatsApp Number</h3>
              <div className="flex">
                <div className="w-1/5 min-w-[90px] max-w-[100px]">
                  <select 
                    className="phone-select rounded-l-lg w-full"
                    disabled={!isFormEnabled} // Disable when form is not enabled
                  >
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
                  disabled={!isFormEnabled} // Disable when form is not enabled
                />
              </div>
            </div>
            </div>
          </div>

          {/* Photos */}
          <div className={`form-section ${!isFormEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            <h2 className="section-title">
              Photos
            </h2>
            <p className="text-md text-black mb-6">
              It's Optional! But, don't forget to upload them later.
            </p>

            <div className="bg-[#FFF6DA] p-4 rounded-2xl flex border border-yellow-200 mb-6">
              <div className="w-1/4 flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1 flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-gray-800">85% of <span className="text-red-500">Buyers</span> enquire on Properties with Photos</h3>
                <p className="text-lg text-gray-600">Upload Photos & Get upto <span className="text-red-500 font-medium">10X more Enquiries</span></p>
              </div>
            </div>

            <div className="upload-area">
              <h3 className="text-2xl text-black font-medium mb-2">Upload your file</h3>
              <p className="text-gray-500 mb-8">File should be an image</p>
              
              <div className="upload-area__drop-zoon mb-6">
                <div className="mb-4">
                  <FileImage className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-400">Add Photos Now</p>
                  <p className="text-sm text-gray-500 mt-2">{`${formData.photos.length}/${MAX_PHOTOS} photos uploaded`}</p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title={isMobile ? "Take photo with camera" : "Use computer camera"}
                    disabled={!isFormEnabled || formData.photos.length >= MAX_PHOTOS} // Disable if form not enabled or max photos reached
                  >
                    <Camera className="w-4 h-4" />
                    {isMobile ? 'Camera' : 'Use Camera'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGallerySelect}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    disabled={!isFormEnabled || formData.photos.length >= MAX_PHOTOS} // Disable if form not enabled or max photos reached
                  >
                    <Image className="w-4 h-4" />
                    Gallery
                  </button>
                </div>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  id="photo-upload"
                  className="hidden"
                  disabled={!isFormEnabled} // Disable when form is not enabled
                />
              </div>
              
              {formData.photos.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">Uploaded Photos ({formData.photos.length}/{MAX_PHOTOS})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg border overflow-hidden group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                            disabled={!isFormEnabled} // Disable when form is not enabled
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.photos.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No photos uploaded yet</p>
                  <p className="text-gray-400 text-xs mt-1">Use camera or gallery buttons above to add photos</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className={`submit-btn ${!isFormEnabled ? "opacity-50 pointer-events-none" : ""}`}
              disabled={!isFormEnabled || isSubmitting} // Disable when form is not enabled or submitting
            >
              {isSubmitting 
                ? "Saving..." 
                : isAuthenticated 
                  ? "Post Property" 
                  : "Login & Post Property"
              }
            </button>
            {submitMessage && (
              <div className="mt-3 text-sm text-gray-700">{submitMessage}</div>
            )}
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
      </main>

      

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;500&family=Poppins:wght@100;200;300;400&display=swap');

        /* Base styles */
        .property-page-container {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .property-form-container {
          max-width: 650px;
          width: 100%;
          margin: 3rem 2rem 7rem auto;
          background-color: rgba(255, 255, 255, 0.98);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          /* Remove heavy blur effects that cause performance issues */
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .property-form-container {
            max-width: calc(100% - 2rem);
            margin: 1rem 1rem 7rem 1rem;
            padding: 1.5rem;
          }
        }

        @media (min-width: 1200px) {
          .property-form-container {
            margin-right: 4rem;
          }
        }

        .form-section {
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          /* Simplified styling for better performance */
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
          background: rgba(255, 255, 255, 0.95);
          outline: none;
          border-radius: 0;
        }

        select {
          font-size: 14px;
          color: #333;
          background: rgba(249, 250, 251, 0.95);
          border: none;
          border-radius: 0px !important;
          border-bottom: 1px solid black !important;
          padding: 0 5px;
          height: 40px;
        }

        .phone-select {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border-radius: 0px !important;
          border-bottom: 1px solid black !important;
          padding: 10px;
          height: 45px;
        }
        
        .txt_field input:focus,
        .txt_field select:hover {
          border-color: #3620ffff;
          background: rgba(255, 255, 255, 1);
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
          box-shadow: 0 4px 15px rgba(208, 38, 2, 0.3);
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          border-color: #D02602;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(208, 38, 2, 0.4);
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
          background: rgba(255, 255, 255, 0.95);
        }

        .radio-option input:checked + label {
          background: rgba(230, 242, 255, 0.95);
          border-color: #2691d9;
          color: #2691d9;
          box-shadow: 0 4px 12px rgba(38, 145, 217, 0.2);
        }

        /* Upload area styling */
        .upload-area {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
          border: 2px solid rgba(224, 231, 255, 0.8);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          margin: 20px 0;
        }

        .upload-area__drop-zoon {
          position: relative;
          min-height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          border: 2px dashed rgba(199, 210, 254, 0.8);
          border-radius: 12px;
          padding: 2rem;
          transition: all 300ms ease-in-out;
          background: rgba(255, 255, 255, 0.7);
        }

        .upload-area__drop-zoon:hover {
          border-color: #6366f1;
          background: rgba(248, 250, 255, 0.9);
        }

        /* Steps section styling */
        .steps-container {
          margin-top: 40px;
        }

        .step-item {
          display: flex;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
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

        /* Custom dropdown styling */
        .select-box {
          position: relative;
          width: 100%;
          margin: 30px 0;
          z-index: 100;
        }

        .custom-dropdown-header {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border-bottom: 1px solid black !important;
          padding: 12px 5px 8px 5px !important;
          margin-bottom: 0 !important;
          border-radius: 0;
        }
        
        .custom-dropdown-header.selected {
          color: #2691d9 !important;
        }

        .options-container {
          background: #f0f0f0;
          color: #1b1b1b;
          max-height: 0;
          width: 100%;
          opacity: 0;
          transition: all 0.4s;
          border-radius: 8px;
          overflow: hidden;
          order: 1;
          margin-top: -1px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .options-container.active {
          position: absolute !important;
          z-index: 1000 !important;
          max-height: 320px !important;
          opacity: 1 !important;
          overflow-y: auto !important;
          width: 100% !important;
          top: 100% !important;
          left: 0 !important;
        }

        .option {
          background-color: #ffffff !important;
          color: #374151 !important;
          padding: 12px 16px !important;
          border-bottom: none !important;
          transition: background-color 0.2s ease !important;
          font-size: 16px !important;
        }

        .option:active,
        .option:hover {
          background-color: #f3f4f6 !important;
        }

        .dropdown-category .category-header,
        .dropdown-category .text-sm {
          background-color: #9ca3af !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 12px 16px !important;
          text-transform: uppercase !important;
          font-size: 14px !important;
          letter-spacing: 0.5px !important;
        }

        /* Custom scrollbar for dropdown */
        .options-container::-webkit-scrollbar {
          width: 6px;
        }

        .options-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .options-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .options-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Enhanced visual elements */
        textarea {
          background: rgba(249, 250, 251, 0.95) !important;
          border: 1px solid rgba(229, 231, 235, 0.8) !important;
        }

        input[type="tel"] {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border: none !important;
          border-bottom: 1px solid black !important;
          border-radius: 0 !important;
          font-size: 16px !important;
          height: 45px !important;
          padding: 0 10px !important;
          margin: 0 !important;
          line-height: normal !important;
          box-shadow: none !important;
        }

        /* Smooth scrolling performance */
        .relative.z-10.flex-1.overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          will-change: scroll-position;
        }

        /* Responsive scrolling */
        @media (max-height: 800px) {
          .property-form-container {
            margin: 1rem auto;
            padding: 1.5rem;
          }
        }

        /* iOS Safari fixes remain the same */
        @supports (-webkit-touch-callout: none) {
          input[type="text"],
          input[type="number"],
          input[type="email"],
          input[type="password"] {
            -webkit-appearance: none !important;
            appearance: none !important;
            background-color: rgba(255, 255, 255, 0.95) !important;
            border: none;
            border-bottom: 1px solid black !important;
            border-radius: 0 !important;
            font-size: 16px !important;
            height: 45px !important;
            padding: 0 10px !important;
            margin: 0 !important;
            line-height: normal !important;
            box-shadow: none !important;
          }

          select {
            -webkit-appearance: none;
            appearance: none;
            background-color: rgba(249, 250, 251, 0.95) !important;
            color: #333 !important;
            border: none !important;
            border-bottom: 1px solid black !important;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 8px center !important;
            padding-right: 24px !important;
            border-radius: 0px !important;
            font-size: 14px !important;
            height: 40px !important;
            box-shadow: none !important;
          }
        }
      `}</style>

     
    </div>
  )
}