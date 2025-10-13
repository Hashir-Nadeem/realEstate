import { useState, useCallback } from 'react'

export interface LocationData {
  lat: number
  lng: number
  accuracy?: number
}

export interface UseGeolocationReturn {
  userLocation: LocationData | null
  isLocating: boolean
  locationError: string | null
  getCurrentLocation: (isInitial?: boolean) => Promise<LocationData>
  clearError: () => void
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setLocationError(null)
  }, [])

  const getCurrentLocation = useCallback((highAccuracy = false) => {
    return new Promise<LocationData>((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      setIsLocating(true);
      setLocationError(null);

      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 10000 : 5000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const locationData = { lat: latitude, lng: longitude, accuracy };
          
          setUserLocation(locationData);
          setIsLocating(false);
          resolve(locationData);
        },
        (error) => {
          let errorMessage = "An unknown error occurred";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please allow location access to use this feature.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out.";
              break;
          }
          setLocationError(errorMessage);
          setIsLocating(false);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }, []);

  return {
    userLocation,
    isLocating,
    locationError,
    getCurrentLocation,
    clearError,
  }
}
