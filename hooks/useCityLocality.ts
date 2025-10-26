import { useState, useCallback, useEffect } from 'react';
import { getLocalitiesForCity, getCitiesFromMap } from '@/data/city-locality-map';
import { findNearestCity, CITIES_WITH_COORDINATES, getCityLocalityKey } from '@/utils/locationUtils';

interface UseCityLocalityOptions {
  userLocation?: { lat: number; lng: number } | null;
  autoSetNearestCity?: boolean;
}

export const useCityLocality = (options: UseCityLocalityOptions = {}) => {
  const { userLocation, autoSetNearestCity = false } = options;
  
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [availableLocalities, setAvailableLocalities] = useState<string[]>([]);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    setSelectedLocality(''); // Reset locality when city changes
    const localities = getLocalitiesForCity(city);
    setAvailableLocalities(localities);
  }, []);

  const handleLocalityChange = useCallback((locality: string) => {
    setSelectedLocality(locality);
  }, []);

  // Set nearest city based on user location
  useEffect(() => {
    if (autoSetNearestCity && userLocation && !selectedCity) {
      const nearestCity = findNearestCity(userLocation, CITIES_WITH_COORDINATES);
      if (nearestCity) {
        // Map the display name to city-locality key
        const cityLocalityKey = getCityLocalityKey(nearestCity.name);
        // Only set if the city exists in our city-locality map
        const cities = getCitiesFromMap();
        if (cities.includes(cityLocalityKey)) {
          handleCityChange(cityLocalityKey);
        }
      }
    }
  }, [userLocation, autoSetNearestCity, selectedCity, handleCityChange]);

  const cities = getCitiesFromMap();

  return {
    selectedCity,
    selectedLocality,
    availableLocalities,
    cities,
    handleCityChange,
    handleLocalityChange,
  };
};
