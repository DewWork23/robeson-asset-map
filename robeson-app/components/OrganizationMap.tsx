'use client';

import { useEffect, useState } from 'react';
import { Organization } from '@/types/organization';
import { getCoordinatesFromAddress, locationCoordinates } from '@/lib/locationUtils';
import { CATEGORY_COLORS } from '@/types/organization';
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
    const map = L.map('map').setView([locationCoordinates.default.lat, locationCoordinates.default.lon], 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Group organizations by location to handle overlapping markers
    const locationGroups = new Map<string, Organization[]>();
    
    organizations.forEach(org => {
      const coords = getCoordinatesFromAddress(org.address);
      if (!coords) return; // Skip if no coordinates found
      const key = `${coords.lat},${coords.lon}`;
      
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(org);
    });

    // Add markers for each location
    locationGroups.forEach((orgs, coordKey) => {
      const [lat, lng] = coordKey.split(',').map(Number);
      
      // Create custom icon based on category
      const category = orgs[0].category;
      const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-600';
      const bgColor = colorClass.replace('bg-', '').replace('-600', '').replace('-700', '');
      
      const icon = L.divIcon({
        html: `<div class="map-marker ${colorClass}" style="background-color: var(--color-${bgColor}-600); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
          <span style="color: white; font-weight: bold;">${orgs.length}</span>
        </div>`,
        className: 'custom-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      
      // Create popup content
      let popupContent = '<div style="max-width: 300px;">';
      orgs.forEach((org, index) => {
        popupContent += `
          <div style="${index > 0 ? 'border-top: 1px solid #e5e5e5; margin-top: 8px; padding-top: 8px;' : ''}">
            <h3 style="font-weight: bold; margin: 0 0 4px 0;">${org.organizationName}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${org.category}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">${org.address}</p>
            ${org.phone ? `<p style="margin: 0; font-size: 14px;"><a href="tel:${org.phone.replace(/\D/g, '')}" style="color: #2563eb;">📞 ${org.phone}</a></p>` : ''}
          </div>
        `;
      });
      popupContent += '</div>';
      
      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        if (onOrganizationClick && orgs.length === 1) {
          onOrganizationClick(orgs[0]);
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

  return <div id="map" className="h-full w-full" />;
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