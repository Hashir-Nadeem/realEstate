import { useState, useCallback } from 'react';
import { getLocalitiesForCity, getCitiesFromMap } from '@/data/city-locality-map';

export const useCityLocality = () => {
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
