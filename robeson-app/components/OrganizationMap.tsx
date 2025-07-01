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

    console.log('Initializing map with center:', [34.6400, -79.1100]);
    
    // Create map with explicit options for better mobile experience
    // Start very zoomed out to ensure we see everything
    const map = L.map('map', {
      center: [34.6400, -79.1100], // Center of Robeson County
      zoom: 9, // Start zoomed out
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      tap: true,
      tapTolerance: 15,
      trackResize: true,
      worldCopyJump: true
    });
    mapRef.current = map;
    
    // Immediately log where the map actually centered
    const actualCenter = map.getCenter();
    console.log('Map actually centered at:', actualCenter.lat, actualCenter.lng);
    
    // Force immediate re-center if it's wrong
    if (Math.abs(actualCenter.lat - 34.6400) > 0.1 || Math.abs(actualCenter.lng - (-79.1100)) > 0.1) {
      console.log('Map center is wrong! Force re-centering to Robeson County');
      map.setView([34.6400, -79.1100], 9);
    }

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
          color: #ffffff;
          background-color: ${town.isCountySeat ? 'rgba(220, 38, 38, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
          padding: 3px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          white-space: nowrap;
          pointer-events: none;
          transform: translateY(-8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
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
    
    // Don't auto-fit to bounds, keep the initial zoom level
    // This ensures we see a wider area around the county
    
    // Force map to recalculate its size
    setTimeout(() => {
      map.invalidateSize();
      // After resize, ensure we're at the right zoom
      map.setView([34.6400, -79.1100], 9);
    }, 100);

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
      
      // Filter out organizations too far from Robeson County
      const robesonCenter = { lat: 34.6400, lon: -79.1100 };
      const distance = Math.sqrt(
        Math.pow(coords.lat - robesonCenter.lat, 2) + 
        Math.pow(coords.lon - robesonCenter.lon, 2)
      );
      
      // Skip if location is too far from county center (roughly 0.7 degrees ~ 50 miles)
      if (distance >= 0.7) {
        console.log(`Skipping organization outside Robeson County area: ${org.organizationName} at ${org.address}`);
        return;
      }
      
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
      
      // Always start by centering on Robeson County
      const robesonCenter = [34.6400, -79.1100] as [number, number];
      
      // Build bounds only from organizations within Robeson County area
      const bounds = L.latLngBounds([]);
      let hasValidCoords = false;
      let debugLocations: string[] = [];
      
      organizations.forEach(org => {
        const coords = getCoordinatesFromAddress(org.address);
        if (coords) {
          // Check if location is within reasonable distance of county center
          const distance = Math.sqrt(
            Math.pow(coords.lat - robesonCenter[0], 2) + 
            Math.pow(coords.lon - robesonCenter[1], 2)
          );
          
          // Only include if within reasonable bounds (roughly 0.7 degrees ~ 50 miles)
          if (distance < 0.7) {
            bounds.extend([coords.lat, coords.lon]);
            hasValidCoords = true;
            debugLocations.push(`${org.organizationName}: ${coords.lat}, ${coords.lon}`);
          } else {
            console.log(`Filtering out distant location: ${org.organizationName} at ${coords.lat}, ${coords.lon} (distance: ${distance})`);
          }
        }
      });
      
      console.log('Valid locations for bounds:', debugLocations);
      
      if (hasValidCoords && bounds.isValid()) {
        // Check if bounds center is reasonable
        const boundsCenter = bounds.getCenter();
        const centerDistance = Math.sqrt(
          Math.pow(boundsCenter.lat - robesonCenter[0], 2) + 
          Math.pow(boundsCenter.lng - robesonCenter[1], 2)
        );
        
        console.log(`Bounds center: ${boundsCenter.lat}, ${boundsCenter.lng} (distance from Robeson: ${centerDistance})`);
        
        // If bounds center is too far from Robeson, just center on Robeson
        if (centerDistance > 0.5) {
          console.log('Bounds center too far from Robeson County, using county center instead');
          map.setView(robesonCenter, 10, {
            animate: true,
            duration: 0.5
          });
        } else {
          // Small delay to ensure map is ready before zooming
          setTimeout(() => {
            // Zoom to show all filtered resources with better framing
            map.fitBounds(bounds, { 
              padding: [200, 200], 
              maxZoom: 10,
              animate: true,
              duration: 0.5
            });
          }, 100);
        }
      } else {
        // If no valid coordinates or all filtered out, center on Robeson County
        console.log('No valid coordinates found, centering on Robeson County');
        map.setView(robesonCenter, 10, {
          animate: true,
          duration: 0.5
        });
      }
    } else if (!selectedCategory && countyBorder) {
      console.log('No category selected, keeping wide view');
      // Keep the wide view when showing all resources
      map.setView([34.6400, -79.1100], 9, {
        animate: true,
        duration: 0.5
      });
    }
  }, [mapReady, L, organizations, selectedCategory, onOrganizationClick]);

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-full w-full relative">
      <div id="map" className="h-full w-full" />
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