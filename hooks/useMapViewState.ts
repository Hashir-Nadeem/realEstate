
import { useState, useCallback } from 'react'
import { LocationData } from './useGeolocation'
import { isLocationClose } from '@/utils/mapUtils'

export interface City {
  name: string
  lat: number
  lng: number
}

export interface UseMapViewStateReturn {
  selectedCity: City | null
  isViewingCurrentLocation: boolean
  zoom: number
  setSelectedCity: (city: City | null) => void
  setIsViewingCurrentLocation: (viewing: boolean) => void
  handleCitySelect: (city: City) => void
  handleShowCurrentLocation: () => void
  handleZoomChange: (newZoom: number) => void
  isLocationClose: (targetLocation: LocationData, threshold?: number) => boolean
}

export const useMapViewState = (
  userLocation: LocationData | null
): UseMapViewStateReturn => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [isViewingCurrentLocation, setIsViewingCurrentLocation] = useState(false)
  const [zoom, setZoom] = useState(12)

  const checkLocationClose = useCallback((
    targetLocation: LocationData, 
    threshold: number = 0.01 // ~1km threshold
  ): boolean => {
    if (!userLocation) return false
    return isLocationClose(userLocation, targetLocation, threshold)
  }, [userLocation])

  const handleCitySelect = useCallback((city: City) => {
    console.log('handleCitySelect called:', city.name)
    setSelectedCity(city)
    setIsViewingCurrentLocation(false)
    setZoom(12) // Zoom out to city level
  }, [])

  const handleShowCurrentLocation = useCallback(() => {
    console.log('handleShowCurrentLocation called')
    setSelectedCity(null)
    setIsViewingCurrentLocation(true)
    setZoom(16) // Zoom in to local level
  }, [])

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  return {
    selectedCity,
    isViewingCurrentLocation,
    zoom,
    setSelectedCity,
    setIsViewingCurrentLocation,
    handleCitySelect,
    handleShowCurrentLocation,
    handleZoomChange,
    isLocationClose: checkLocationClose,
  }
}
