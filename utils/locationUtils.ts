/**
 * Calculate the distance between two geographic points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Find the nearest city from a list of cities with coordinates
 * @param userLocation Current user location
 * @param cities Array of cities with lat/lng coordinates
 * @returns The nearest city object or null
 */
export const findNearestCity = (
  userLocation: { lat: number; lng: number },
  cities: { name: string; lat: number; lng: number }[]
): { name: string; lat: number; lng: number } | null => {
  if (!userLocation || !cities || cities.length === 0) {
    return null;
  }

  let nearestCity = null;
  let minDistance = Infinity;

  for (const city of cities) {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      city.lat,
      city.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity;
};

/**
 * Hardcoded cities with coordinates that match both the main page and city-locality map
 */
export const CITIES_WITH_COORDINATES = [
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Fremont", lat: 37.5485, lng: -121.9886 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "New Delhi", lat: 28.6139, lng: 77.209 }, // Note: This should map to "Delhi" in city-locality-map
  { name: "Vijayawada", lat: 16.5062, lng: 80.648 },
  { name: "Amaravathi, AP", lat: 16.5413, lng: 80.5109 }, // Added from city-locality map
];

/**
 * Map display names to city-locality map keys
 */
export const CITY_NAME_MAPPING: Record<string, string> = {
  "New Delhi": "Delhi",
  "Bangalore": "Bangalore", 
  "Chennai": "Chennai",
  "Hyderabad": "Hyderabad",
  "Kolkata": "Kolkata", 
  "Mumbai": "Mumbai",
  "Vijayawada": "Vijayawada",
  "Amaravathi, AP": "Amaravathi, AP",
  "Fremont": "Fremont", // This might not have localities
};

/**
 * Get the city name that matches the city-locality map
 * @param displayName The display name of the city
 * @returns The key used in city-locality map
 */
export const getCityLocalityKey = (displayName: string): string => {
  return CITY_NAME_MAPPING[displayName] || displayName;
};