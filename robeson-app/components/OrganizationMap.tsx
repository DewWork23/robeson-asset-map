'use client';

import { useEffect, useState, useRef } from 'react';
import { Organization, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/organization';
import { getCoordinatesFromAddress, locationCoordinates, resetLocationOffsets } from '@/lib/locationUtils';
import { robesonCountyBoundary } from '@/lib/robesonCountyBoundary';
import dynamic from 'next/dynamic';

interface OrganizationMapProps {
  organizations: Organization[];
  allOrganizations?: Organization[];
  selectedCategory?: string | null;
  onCategorySelect?: (category: string | null) => void;
  selectedOrganization?: Organization | null;
  onOrganizationClick?: (org: Organization) => void;
}

const MapContent = ({ organizations, allOrganizations = [], selectedCategory, onCategorySelect, selectedOrganization, onOrganizationClick }: OrganizationMapProps) => {
  const [L, setL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const countyBorderRef = useRef<any>(null);
  const organizationLayerRef = useRef<any>(null);

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

  // Initialize map only once
  useEffect(() => {
    if (!mapReady || !L || mapRef.current) return;

    console.log('Initializing map...');
    
    // Create map with explicit options for better mobile experience
    const map = L.map('map', {
      center: [locationCoordinates.default.lat, locationCoordinates.default.lon],
      zoom: 11,
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      tap: true,
      tapTolerance: 15,
      trackResize: true
    });
    mapRef.current = map;

    // Create custom panes for better layer control
    map.createPane('townLabels');
    map.getPane('townLabels').style.zIndex = '650';
    map.getPane('townLabels').style.pointerEvents = 'none';

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add county boundary
    const countyBorder = L.polygon(robesonCountyBoundary, {
      color: '#1e40af',
      weight: 3,
      opacity: 0.8,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: '5, 10'
    }).addTo(map);
    countyBorderRef.current = countyBorder;
    
    // Add town/city markers
    const majorTowns = [
      { name: 'Lumberton', coords: locationCoordinates.lumberton, isCountySeat: true },
      { name: 'Pembroke', coords: locationCoordinates.pembroke },
      { name: 'Fairmont', coords: locationCoordinates.fairmont },
      { name: 'Maxton', coords: locationCoordinates.maxton },
      { name: 'Red Springs', coords: locationCoordinates['red springs'] },
      { name: 'St. Pauls', coords: locationCoordinates['st. pauls'] },
      { name: 'Rowland', coords: locationCoordinates.rowland },
      { name: 'Parkton', coords: locationCoordinates.parkton },
    ];

    // Create layer groups
    const townLayer = L.layerGroup().addTo(map);
    const organizationLayer = L.layerGroup().addTo(map);
    organizationLayerRef.current = organizationLayer;
    
    majorTowns.forEach(town => {
      const circle = L.circleMarker([town.coords.lat, town.coords.lon], {
        radius: town.isCountySeat ? 12 : 8,
        fillColor: town.isCountySeat ? '#dc2626' : '#3b82f6',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
        pane: 'markerPane'
      }).addTo(townLayer);

      const icon = L.divIcon({
        html: `<div style="
          font-weight: ${town.isCountySeat ? 'bold' : '600'};
          font-size: ${town.isCountySeat ? '15px' : '13px'};
          color: #1e293b;
          background-color: rgba(255, 255, 255, 0.95);
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          pointer-events: none;
          transform: translateY(-8px);
        ">${town.name}${town.isCountySeat ? ' (County Seat)' : ''}</div>`,
        className: 'town-label',
        iconSize: [0, 0],
        iconAnchor: [0, -25]
      });

      L.marker([town.coords.lat, town.coords.lon], { icon, pane: 'townLabels' }).addTo(map);
      
      circle.bindTooltip(town.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10]
      });
    });
    
    // Set initial view with more padding for better navigation
    map.fitBounds(countyBorder.getBounds(), { 
      padding: [50, 50],
      maxZoom: 13 
    });

    // Add layer control
    const overlays = {
      "Resources": organizationLayer,
      "Towns": townLayer
    };
    L.control.layers(null, overlays, { position: 'topright', collapsed: false }).addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapReady, L]);

  // Update markers and handle zoom when organizations or category changes
  useEffect(() => {
    if (!mapReady || !L || !mapRef.current || !organizationLayerRef.current) return;

    const map = mapRef.current;
    const organizationLayer = organizationLayerRef.current;
    const countyBorder = countyBorderRef.current;

    console.log('Updating markers, selectedCategory:', selectedCategory, 'organizations:', organizations.length);

    // Clear existing markers
    markersRef.current.forEach(marker => {
      organizationLayer.removeLayer(marker);
    });
    markersRef.current = [];

    // Reset offsets for consistent positioning
    resetLocationOffsets();

    // Add new markers
    organizations.forEach(org => {
      const coords = getCoordinatesFromAddress(org.address);
      if (!coords) return;
      
      const categoryIcon = CATEGORY_ICONS[org.category as keyof typeof CATEGORY_ICONS] || '📍';
      
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: white;
            border: 2px solid #1e293b;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            ${categoryIcon}
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #1e293b;
          "></div>
        `,
        className: 'custom-emoji-marker',
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([coords.lat, coords.lon], { icon }).addTo(organizationLayer);
      markersRef.current.push(marker);
      
      const encodedAddress = encodeURIComponent(org.address);
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      
      const popupContent = `
        <div style="max-width: 300px;">
          <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 16px;">${org.organizationName}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${org.category}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px;">${org.address}</p>
          ${org.phone ? `<p style="margin: 0 0 4px 0; font-size: 14px;"><a href="tel:${org.phone.replace(/\D/g, '')}" style="color: #2563eb; text-decoration: none; font-weight: 500;">📞 ${org.phone}</a></p>` : ''}
          ${org.hours ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #666;"><strong>Hours:</strong> ${org.hours}</p>` : ''}
          ${org.servicesOffered ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #666;"><strong>Services:</strong> ${org.servicesOffered.substring(0, 100)}${org.servicesOffered.length > 100 ? '...' : ''}</p>` : ''}
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            ${org.phone ? `<a href="tel:${org.phone.replace(/\D/g, '')}" style="flex: 1; display: inline-block; padding: 8px 12px; background-color: #16a34a; color: white; text-align: center; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">Call</a>` : ''}
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: inline-block; padding: 8px 12px; background-color: #2563eb; color: white; text-align: center; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">📍 Directions</a>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        if (onOrganizationClick) {
          onOrganizationClick(org);
        }
      });
    });

    // Handle zoom based on selected category
    if (selectedCategory && organizations.length > 0) {
      console.log(`Zooming to category: ${selectedCategory}, organizations: ${organizations.length}`);
      const bounds = L.latLngBounds([]);
      let hasValidCoords = false;
      
      organizations.forEach(org => {
        const coords = getCoordinatesFromAddress(org.address);
        if (coords) {
          bounds.extend([coords.lat, coords.lon]);
          hasValidCoords = true;
        }
      });
      
      if (hasValidCoords && bounds.isValid()) {
        console.log('Bounds are valid, zooming to:', bounds.toBBoxString());
        
        // Force immediate zoom without checking current view
        map.fitBounds(bounds, { 
          padding: [80, 80], 
          maxZoom: 14,
          animate: true,
          duration: 0.5
        });
      }
    } else if (!selectedCategory && countyBorder) {
      console.log('No category selected, resetting to county view');
      // Reset to county view
      map.fitBounds(countyBorder.getBounds(), { 
        padding: [20, 20],
        animate: true,
        duration: 0.5
      });
    }
  }, [mapReady, L, organizations, selectedCategory, onOrganizationClick]);

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Loading map...</div>;
  }

  // Get unique categories from ALL organizations
  const uniqueCategories = Array.from(new Set(allOrganizations.map(org => org.category))).sort();
  
  // Create legend items with icons
  const legendItems = uniqueCategories.map(category => {
    const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📍';
    return { category, icon };
  });

  return (
    <div className="h-full w-full relative flex flex-col">
      {/* Top Category Bar */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 z-[1000]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by category:
          </label>
          
          {/* Category Dropdown */}
          <select
            id="category-filter"
            value={selectedCategory || ''}
            onChange={(e) => onCategorySelect && onCategorySelect(e.target.value || null)}
            className="w-full sm:w-auto px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Categories ({allOrganizations.length} locations)</option>
            {legendItems.map(({ category, icon }) => {
              const count = allOrganizations.filter(org => org.category === category).length;
              return (
                <option key={category} value={category}>
                  {icon} {category} ({count} locations)
                </option>
              );
            })}
          </select>
          
          {/* Current status */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{organizations.length}</span> of <span className="font-medium">{allOrganizations.length}</span> locations
          </div>
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