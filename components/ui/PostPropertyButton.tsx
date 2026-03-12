"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, MapPin } from "lucide-react"
import { toast } from "react-toastify"

interface PostPropertyButtonProps {
  isViewingCurrentLocation: boolean
  onShowCurrentLocation: () => void
  isLocating?: boolean
}

interface UserCountryInfo {
  code: string | null
  name: string | null
}

export const PostPropertyButton: React.FC<PostPropertyButtonProps> = ({
  isViewingCurrentLocation,
  onShowCurrentLocation,
  isLocating = false,
}) => {
  const [userCountryInfo, setUserCountryInfo] =
    useState<UserCountryInfo>({ code: null, name: null })
  const [isCheckingCountry, setIsCheckingCountry] = useState(true)

  const allowedCountries = ["US", "PK", "IN"]

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        // ✅ CORS-friendly API
        const res = await fetch("https://ipwho.is/")
        const data = await res.json()

        if (data.success) {
          setUserCountryInfo({
            code: data.country_code,
            name: data.country,
          })
        } else {
          setUserCountryInfo({ code: null, name: null })
        }
      } catch (error) {
        console.error("Country fetch failed:", error)
        setUserCountryInfo({ code: null, name: null })
      } finally {
        setIsCheckingCountry(false)
      }
    }

    fetchUserCountry()
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (isCheckingCountry) {
      e.preventDefault()
      return
    }

    const countryCode = userCountryInfo.code

    if (countryCode && !allowedCountries.includes(countryCode)) {
      e.preventDefault()
      toast.error(
        `Posting from ${userCountryInfo.name || "your country"} is not supported.`
      )
    }
  }

  // =============================
  // SHOW POST BUTTON
  // =============================
  if (isViewingCurrentLocation) {
    return (
      <Link
        href="/post-property"
        onClick={handleClick}
        className={`w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 text-base font-medium rounded-lg transition-colors ${
          isCheckingCountry ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        {isCheckingCountry ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Verifying...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 mr-2" />
            Post Property Ad for Free!
          </>
        )}
      </Link>
    )
  }

  // =============================
  // SHOW LOCATION BUTTON
  // =============================
  return (
    <Button
      onClick={onShowCurrentLocation}
      disabled={isLocating}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-base font-medium rounded-lg"
    >
      {isLocating ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Getting location...
        </>
      ) : (
        <>
          <MapPin className="w-5 h-5 mr-2" />
          Show current location to post property
        </>
      )}
    </Button>
  )
}