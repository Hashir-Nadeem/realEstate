import { useCallback, useRef } from 'react';
import { isMarkerInLeafletBounds, panToMarkerIfNeeded } from '@/utils/mapUtils';

export interface UseMapBoundsReturn {
  isMarkerVisible: (lat: number, lng: number) => boolean;
  panToMarker: (lat: number, lng: number) => void;
  getCurrentBounds: () => any;
}

export const useMapBounds = (mapRef: React.MutableRefObject<any>): UseMapBoundsReturn => {
  const isMarkerVisible = useCallback((lat: number, lng: number): boolean => {
    if (!mapRef.current) return false;
    return isMarkerInLeafletBounds(lat, lng, mapRef.current);
  }, [mapRef]);

  const panToMarker = useCallback((lat: number, lng: number): void => {
    if (!mapRef.current) return;
    panToMarkerIfNeeded(lat, lng, mapRef.current, 'leaflet');
  }, [mapRef]);

  const getCurrentBounds = useCallback(() => {
    if (!mapRef.current) return null;
    try {
      return mapRef.current.getBounds();
    } catch (error) {
      console.warn('Error getting map bounds:', error);
      return null;
    }
  }, [mapRef]);

  return {
    isMarkerVisible,
    panToMarker,
    getCurrentBounds,
  };
};
