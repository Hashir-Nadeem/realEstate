import { useState, useCallback } from 'react';

export const useMapZoom = (initialZoom: number = 15) => {
  const [zoom, setZoom] = useState(initialZoom);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  return {
    zoom,
    onZoomChange: handleZoomChange,
  };
};
