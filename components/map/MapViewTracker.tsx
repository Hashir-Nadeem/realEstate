import { useEffect, useRef } from 'react';
import { LocationData } from '@/hooks/useGeolocation';
import { isMarkerInLeafletBounds } from '@/utils/mapUtils';

interface MapViewTrackerProps {
  mapRef: React.MutableRefObject<any>;
  userLocation: LocationData | null;
  onViewChange: (isViewingCurrentLocation: boolean) => void;
}

export const MapViewTracker: React.FC<MapViewTrackerProps> = ({
  mapRef,
  userLocation,
  onViewChange,
}) => {
  const lastViewState = useRef<boolean | null>(null);
  const attachRetryRef = useRef<NodeJS.Timeout>();
  const detachFnRef = useRef<null | (() => void)>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;

      const map = mapRef.current;
      if (!map || !userLocation || !window.L) {
        // Retry shortly until map and userLocation are ready
        attachRetryRef.current = setTimeout(attach, 100);
        return;
      }

      const checkViewState = () => {
        try {
          const isViewingCurrentLocation = isMarkerInLeafletBounds(
            userLocation.lat,
            userLocation.lng,
            map
          );

          if (lastViewState.current === null || isViewingCurrentLocation !== lastViewState.current) {
            lastViewState.current = isViewingCurrentLocation;
            console.log('MapViewTracker: 🔄 VIEW STATE CHANGED TO:', isViewingCurrentLocation);
            onViewChange(isViewingCurrentLocation);
          }
        } catch (error) {
          console.warn('MapViewTracker: Error checking view state:', error);
        }
      };

      // Throttled check to prevent excessive calls during rapid map movements
      const throttledCheck = () => {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        checkTimeoutRef.current = setTimeout(checkViewState, 50); // Use a small throttle
      };

      // Set initial state after map is ready
      map.whenReady(() => {
        setTimeout(() => {
          lastViewState.current = null; // Reset to force initial check
          checkViewState();
        }, 150); // Small delay for map to settle
      });

      // Use throttled checks for move and zoom events
      map.on('move', throttledCheck);
      map.on('zoom', throttledCheck);

      // Save detach function for cleanup
      detachFnRef.current = () => {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        if (map && map.off) {
          map.off('move', throttledCheck);
          map.off('zoom', throttledCheck);
        }
      };
    };

    attach();

    return () => {
      cancelled = true;
      if (attachRetryRef.current) {
        clearTimeout(attachRetryRef.current);
      }
      if (detachFnRef.current) {
        detachFnRef.current();
        detachFnRef.current = null;
      }
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [mapRef, userLocation, onViewChange]);

  return null;
};
