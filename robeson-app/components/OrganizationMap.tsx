'use client';

import { useEffect, useState } from 'react';
import { Organization, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/organization';
import { getCoordinatesFromAddress, locationCoordinates, resetLocationOffsets } from '@/lib/locationUtils';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

    // Reset offsets for consistent positioning
    resetLocationOffsets();

    // Filter organizations based on selected category
    const filteredOrganizations = selectedCategory 
      ? organizations.filter(org => org.category === selectedCategory)
      : organizations;

    // Add individual markers for each organization
    filteredOrganizations.forEach(org => {
      const coords = getCoordinatesFromAddress(org.address);
      if (!coords) return; // Skip if no coordinates found
      
      // Create custom icon based on category
      const category = org.category;
      const categoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📍';
      
      // Create a div icon with the emoji
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: white;
            border: 2px solid #1e293b;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            ${categoryIcon}
          </div>
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #1e293b;
          "></div>
        `,
        className: 'custom-emoji-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
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

    // If category is selected and there are filtered pins, zoom to show them
    if (selectedCategory && filteredOrganizations.length > 0) {
      const bounds = L.latLngBounds([]);
      filteredOrganizations.forEach(org => {
        const coords = getCoordinatesFromAddress(org.address);
        if (coords) {
          bounds.extend([coords.lat, coords.lon]);
        }
      });
      if (bounds.isValid()) {
        setTimeout(() => {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }, 100);
      }
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [mapReady, L, organizations, selectedOrganization, onOrganizationClick, selectedCategory]);

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Loading map...</div>;
  }

  // Get unique categories from organizations
  const uniqueCategories = Array.from(new Set(organizations.map(org => org.category))).sort();
  
  // Create legend items with icons
  const legendItems = uniqueCategories.map(category => {
    const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📍';
    return { category, icon };
  });

  return (
    <div className="h-full w-full relative flex flex-col">
      {/* Top Category Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 z-[1000]">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-3">Filter by:</span>
          
          {/* All Categories Button */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] min-w-fit ${
              !selectedCategory
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="leading-tight">All Categories</span>
              <span className={`text-xs font-normal leading-tight ${!selectedCategory ? 'text-blue-100' : 'text-gray-500'}`}>
                {organizations.length} locations
              </span>
            </div>
          </button>
          
          {/* Category Buttons */}
          {legendItems.map(({ category, icon }) => {
            const isSelected = selectedCategory === category;
            const count = organizations.filter(org => org.category === category).length;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(isSelected ? null : category)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] min-w-fit ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={`${category} (${count} locations)`}
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="flex flex-col items-start">
                  <span className="leading-tight">{category}</span>
                  <span className={`text-xs font-normal leading-tight ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    {count} locations
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Map Container */}
      <div className="flex-1 relative">
        <div id="map" className="h-full w-full" />
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