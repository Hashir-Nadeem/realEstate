import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, MapPin } from "lucide-react"
import { toast } from "react-toastify" // Ensure react-toastify is installed and configured

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
  const [userCountryInfo, setUserCountryInfo] = useState<UserCountryInfo>({ code: null, name: null })
  const [isCheckingCountry, setIsCheckingCountry] = useState(true)
  const allowedCountries = ["US", "PK", "IN"] // USA, Pakistan, India

  useEffect(() => {
    const fetchUserCountry = async () => {
      setIsCheckingCountry(true)
      try {
        const res = await fetch("https://ipapi.co/json/")
        if (!res.ok) throw new Error("Failed to fetch location")
        const data = await res.json()
        setUserCountryInfo({ code: data.country_code, name: data.country_name })
      } catch (error) {
        console.error("Error fetching user country:", error)
        // Allow posting even if country check fails, to not block users.
        setUserCountryInfo({ code: null, name: null })
      } finally {
        setIsCheckingCountry(false)
      }
    }

    fetchUserCountry()
  }, [])

  const handlePostPropertyClick = (e: React.MouseEvent) => {
    if (isCheckingCountry) {
      e.preventDefault()
      return
    }

    const countryCode = userCountryInfo.code
    if (countryCode && !allowedCountries.includes(countryCode)) {
      e.preventDefault()
      const countryName = userCountryInfo.name || "your country"
      toast.error(`Posting from ${countryName} is not currently supported.`)
      return
    }
    // If check is passed, navigation will proceed.
    // Using Link component for better Next.js navigation.
  }

  if (isViewingCurrentLocation) {
    const isButtonDisabled = isCheckingCountry
    const buttonContent = isCheckingCountry ? (
      <>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Verifying...
      </>
    ) : (
      <>
        <Plus className="w-5 h-5 mr-2" />
        Post Property Ad for Free!
      </>
    )

    return (
      <Link href="/post-property" passHref legacyBehavior>
        <a
          onClick={handlePostPropertyClick}
          className={`w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 text-base font-medium rounded-lg transition-colors ${
            isButtonDisabled ? "cursor-not-allowed opacity-70" : ""
          }`}
          aria-disabled={isButtonDisabled}
          style={isButtonDisabled ? { pointerEvents: "none" } : {}}
        >
          {buttonContent}
        </a>
      </Link>
    )
  }

  return (
    <Button
      onClick={onShowCurrentLocation}
      disabled={isLocating}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-base font-medium rounded-lg transition-colors"
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
