'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import OrganizationMap with no SSR
const OrganizationMap = dynamic(() => import('./OrganizationMap'), {
  ssr: false,
  loading: () => null, // No loading indicator needed for invisible component
});

interface MapPreloaderProps {
  dataReady?: boolean;
}

export default function MapPreloader({ dataReady = false }: MapPreloaderProps) {
  const [shouldPreload, setShouldPreload] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    // Only start preloading when data is ready and we haven't already preloaded
    if (dataReady && !preloadComplete && !shouldPreload) {
      // Small delay to ensure main content loads first
      const timer = setTimeout(() => {
        setShouldPreload(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [dataReady, preloadComplete, shouldPreload]);

  // Mark preload as complete after component mounts
  useEffect(() => {
    if (shouldPreload) {
      // Give the map component time to initialize
      const timer = setTimeout(() => {
        setPreloadComplete(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldPreload]);

  // Don't render anything if we shouldn't preload yet or if preload is complete
  if (!shouldPreload || preloadComplete) {
    return null;
  }

  return (
    <div 
      style={{ 
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -9999,
      }}
      aria-hidden="true"
    >
      <OrganizationMap 
        organizations={[]} // Empty array since we're just preloading resources
      />
    </div>
  );
}