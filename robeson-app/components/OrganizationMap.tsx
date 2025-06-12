'use client';

import { useEffect, useState } from 'react';
import { Organization, CATEGORY_COLORS } from '@/types/organization';
import { getCoordinatesFromAddress, locationCoordinates } from '@/lib/locationUtils';
import { robesonCountyBoundary } from '@/lib/robesonCountyBoundary';
import dynamic from 'next/dynamic';

interface OrganizationMapProps {
  organizations: Organization[];
  selectedOrganization?: Organization | null;
  onOrganizationClick?: (org: Organization) => void;
}

const MapContent = ({ organizations, selectedOrganization, onOrganizationClick }: OrganizationMapProps) => {
  const [L, setL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Dynamically import leaflet
    import('leaflet').then((leaflet) => {
      const L = leaflet.default;
      
      // Fix for default markers in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      
      setL(L);
      
      // Add Leaflet CSS to the document
      if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
      
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!mapReady || !L) return;

    // Create map
    const map = L.map('map').setView([locationCoordinates.default.lat, locationCoordinates.default.lon], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add county boundary
    const countyBorder = L.polygon(robesonCountyBoundary, {
      color: '#1e40af', // Dark blue border
      weight: 3,
      opacity: 0.8,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: '5, 10' // Dashed line pattern
    }).addTo(map);
    
    // Fit the map to show the entire county
    map.fitBounds(countyBorder.getBounds(), { padding: [20, 20] });

    // Add individual markers for each organization
    organizations.forEach(org => {
      const coords = getCoordinatesFromAddress(org.address);
      if (!coords) return; // Skip if no coordinates found
      
      // Create custom icon based on category
      const category = org.category;
      const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-600';
      
      // Get the actual color value for the marker
      const colorMap: Record<string, string> = {
        'bg-blue-600': '#2563EB',
        'bg-emerald-600': '#059669',
        'bg-red-600': '#DC2626',
        'bg-red-700': '#B91C1C',
        'bg-indigo-600': '#4F46E5',
        'bg-orange-600': '#EA580C',
        'bg-purple-600': '#9333EA',
        'bg-teal-600': '#0891B2',
        'bg-green-600': '#16A34A',
        'bg-gray-600': '#4B5563',
        'bg-amber-700': '#B45309',
        'bg-slate-600': '#475569'
      };
      
      const markerColor = colorMap[colorClass] || '#3B82F6'; // Default blue
      
      // Use standard Leaflet marker with custom color
      const icon = L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 0C5.5 0 0 5.5 0 12.5C0 21.5 12.5 41 12.5 41S25 21.5 25 12.5C25 5.5 19.5 0 12.5 0Z" fill="${markerColor}"/>
            <circle cx="12.5" cy="12.5" r="8" fill="white"/>
            <circle cx="12.5" cy="12.5" r="5" fill="${markerColor}"/>
          </svg>
        `)}`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const marker = L.marker([coords.lat, coords.lon], { icon }).addTo(map);
      
      // Create popup content
      const popupContent = `
        <div style="max-width: 300px;">
          <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 16px;">${org.organizationName}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${org.category}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px;">${org.address}</p>
          ${org.phone ? `<p style="margin: 0 0 4px 0; font-size: 14px;"><a href="tel:${org.phone.replace(/\D/g, '')}" style="color: #2563eb; text-decoration: none; font-weight: 500;">📞 ${org.phone}</a></p>` : ''}
          ${org.hours ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #666;"><strong>Hours:</strong> ${org.hours}</p>` : ''}
          ${org.servicesOffered ? `<p style="margin: 0; font-size: 13px; color: #666;"><strong>Services:</strong> ${org.servicesOffered.substring(0, 100)}${org.servicesOffered.length > 100 ? '...' : ''}</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        if (onOrganizationClick) {
          onOrganizationClick(org);
        }
      });
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, [mapReady, L, organizations, selectedOrganization, onOrganizationClick]);

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Loading map...</div>;
  }

  // Get unique categories from organizations
  const uniqueCategories = Array.from(new Set(organizations.map(org => org.category))).sort();
  
  // Create legend items with colors
  const legendItems = uniqueCategories.map(category => {
    const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-600';
    const colorMap: Record<string, string> = {
      'bg-blue-600': '#2563EB',
      'bg-emerald-600': '#059669',
      'bg-red-600': '#DC2626',
      'bg-red-700': '#B91C1C',
      'bg-indigo-600': '#4F46E5',
      'bg-orange-600': '#EA580C',
      'bg-purple-600': '#9333EA',
      'bg-teal-600': '#0891B2',
      'bg-green-600': '#16A34A',
      'bg-gray-600': '#4B5563',
      'bg-amber-700': '#B45309',
      'bg-slate-600': '#475569'
    };
    return { category, color: colorMap[colorClass] || '#3B82F6' };
  });

  return (
    <div className="h-full w-full relative">
      <div id="map" className="h-full w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-[1000]">
        <h3 className="text-sm font-semibold mb-2">Categories</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {legendItems.map(({ category, color }) => (
            <div key={category} className="flex items-center space-x-2">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill={color} />
                <circle cx="10" cy="10" r="5" fill="white" />
                <circle cx="10" cy="10" r="3" fill={color} />
              </svg>
              <span className="text-xs">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dynamic import to avoid SSR issues
const OrganizationMap = dynamic(
  () => Promise.resolve(MapContent),
  {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center">Loading map...</div>
  }
);

export default OrganizationMap;