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
  const checkTimeoutRef = useRef<NodeJS.Timeout>();
  const attachRetryRef = useRef<NodeJS.Timeout>();
  const detachFnRef = useRef<null | (() => void)>(null);

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

      const immediateCheck = () => {
        checkViewState();
      };

      const debouncedCheck = () => {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        checkTimeoutRef.current = setTimeout(checkViewState, 50);
      };

      // Set initial state after map is ready (will fire immediately if already ready)
      map.whenReady(() => {
        setTimeout(() => {
          lastViewState.current = null; // Reset to force initial check
          checkViewState();
        }, 100);
      });

      // Use immediate check for move events for responsiveness
      map.on('move', immediateCheck);
      map.on('moveend', debouncedCheck);
      map.on('zoomend', debouncedCheck);

      // Save detach function for cleanup
      detachFnRef.current = () => {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        if (map && map.off) {
          map.off('move', immediateCheck);
          map.off('moveend', debouncedCheck);
          map.off('zoomend', debouncedCheck);
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
