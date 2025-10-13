/**
 * Map bounds detection utilities for different map libraries
 */

// Leaflet bounds detection - Simple and reliable way
export const isMarkerInLeafletBounds = (
  lat: number,
  lng: number,
  map: any,
  zoom?: number
): boolean => {
  if (!map || !window.L) {
    return false;
  }

  try {
    const mapBounds = map.getBounds();
    const markerLatLng = window.L.latLng(lat, lng);

    // Simple bounds check - if marker is in the visible area
    const isMarkerVisible = mapBounds.contains(markerLatLng);

    return isMarkerVisible;
  } catch (error) {
    console.warn('Error checking marker bounds:', error);
    return false;
  }
};

// Get optimal zoom level based on accuracy
export const getOptimalZoom = (accuracy?: number) => {
  if (!accuracy) return 14; // Default zoom if no accuracy info

  // More conservative zoom levels for better overview
  if (accuracy > 1000) return 11; // Very poor accuracy - city level
  if (accuracy > 500) return 12; // Poor accuracy - district level
  if (accuracy > 200) return 13; // Fair accuracy - neighborhood level
  if (accuracy > 100) return 14; // Good accuracy - area level
  if (accuracy > 50) return 15; // Very good accuracy - street level
  return 16; // Excellent accuracy - building level
};

// Check if location is close to another location
export const isLocationClose = (
  userLocation: { lat: number; lng: number },
  targetLocation: { lat: number; lng: number }, 
  threshold: number = 0.01 // ~1km threshold
): boolean => {
  if (!userLocation) return false;
  
  const latDiff = Math.abs(userLocation.lat - targetLocation.lat);
  const lngDiff = Math.abs(userLocation.lng - targetLocation.lng);
  
  return latDiff < threshold && lngDiff < threshold;
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Convert to meters
};

// Pan map to show marker if not visible
export const panToMarkerIfNeeded = (
  lat: number,
  lng: number,
  map: any,
  mapType: 'leaflet' | 'google' | 'mapbox' = 'leaflet'
): void => {
  let isVisible = false;
  
  switch (mapType) {
    case 'leaflet':
      isVisible = isMarkerInLeafletBounds(lat, lng, map);
      if (!isVisible && window.L) {
        map.panTo(window.L.latLng(lat, lng));
      }
      break;
  }
};
