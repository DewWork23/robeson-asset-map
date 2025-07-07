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
  const lastSelectedOrgRef = useRef<string | null>(null);
  const preventZoomRef = useRef(false);
  const expandedClustersRef = useRef<Set<any>>(new Set());
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [onResetView, setOnResetView] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Dynamically import leaflet and marker cluster
    Promise.all([
      import('leaflet'),
      import('leaflet.markercluster')
    ]).then(([leafletModule, markerClusterModule]) => {
      const L = leafletModule.default;
      
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
        
        // Add marker cluster CSS
        const clusterLink = document.createElement('link');
        clusterLink.rel = 'stylesheet';
        clusterLink.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
        document.head.appendChild(clusterLink);
        
        const clusterDefaultLink = document.createElement('link');
        clusterDefaultLink.rel = 'stylesheet';
        clusterDefaultLink.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
        document.head.appendChild(clusterDefaultLink);
      }
      
      setMapReady(true);
    });
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!mapReady || !L) return;
    
    // More robust check for existing map
    if (mapRef.current) {
      console.log('Map already exists in mapRef, skipping initialization');
      return;
    }

    console.log('Initializing map with center:', [34.6400, -79.1100]);
    
    // Check if the container already has a map and clean it up
    const container = document.getElementById('map');
    if (!container) {
      console.log('Map container not found');
      return;
    }
    
    if ((container as any)._leaflet_id) {
      console.log('Map container already has Leaflet instance, attempting cleanup...');
      // Try to find and remove existing map instance
      try {
        const existingMap = (container as any)._leaflet_map;
        if (existingMap) {
          existingMap.remove();
        }
      } catch (e) {
        console.error('Error cleaning up existing map:', e);
      }
      delete (container as any)._leaflet_id;
    }
    
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
    
    // Map click handler - no special behavior needed now
    map.on('click', (e: any) => {
      // Normal map click behavior
    });

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
    
    // Create marker cluster group with custom options
    const organizationLayer = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 80, // Increased to better capture organizations at same address
      spiderfyOnMaxZoom: false, // Disable spiderfy - we'll handle zoom manually
      disableClusteringAtZoom: 16, // Show individual markers at zoom 16+
      animate: true,
      animateAddingMarkers: true,
      removeOutsideVisibleBounds: false, // Keep all markers loaded
      zoomToBoundsOnClick: true, // Enable zoom on click
      singleMarkerMode: true, // Always show single markers (no clustering for single items)
      // Custom cluster icon creation
      iconCreateFunction: function(cluster: any) {
        const count = cluster.getChildCount();
        let size = 'small';
        let className = 'marker-cluster-small';
        
        if (count > 10) {
          size = 'large';
          className = 'marker-cluster-large';
        } else if (count > 5) {
          size = 'medium';
          className = 'marker-cluster-medium';
        }
        
        return new (L as any).DivIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: new (L as any).Point(40, 40)
        });
      }
    }).addTo(map);
    
    organizationLayerRef.current = organizationLayer;
    
    // Add cluster event handlers
    organizationLayer.on('clustermouseover', (e: any) => {
      e.propagatedFrom.setOpacity(0.8);
    });
    
    organizationLayer.on('clustermouseout', (e: any) => {
      e.propagatedFrom.setOpacity(1);
    });
    
    
    // Handle cluster clicks manually - zoom to show actual locations
    organizationLayer.on('clusterclick', (e: any) => {
      const cluster = e.layer;
      const childMarkers = cluster.getAllChildMarkers();
      
      console.log('Cluster clicked, child count:', childMarkers.length);
      
      // Get bounds of all child markers
      const group = L.featureGroup(childMarkers);
      const bounds = group.getBounds();
      
      // Calculate appropriate zoom level
      const currentZoom = map.getZoom();
      let targetZoom = currentZoom + 2;
      
      // If we're already pretty zoomed in, go to max zoom
      if (currentZoom >= 14) {
        targetZoom = 18;
      }
      
      // Zoom to show all markers in the cluster
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: targetZoom,
        animate: true,
        duration: 0.5
      });
      
      // Don't prevent default - let the cluster library handle the zoom
      return true;
    });
      
    
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
          color: ${town.isCountySeat ? '#dc2626' : '#1e40af'};
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
    
    // Track zoom level changes
    map.on('zoomend', () => {
      const currentZoom = map.getZoom();
      setIsZoomedIn(currentZoom > 11);
    });
    

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
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

    // Check if this is just an organization selection change (not category change)
    const isJustOrgSelection = selectedOrganization?.id !== lastSelectedOrgRef.current && 
                               selectedOrganization?.id && 
                               !preventZoomRef.current;
    lastSelectedOrgRef.current = selectedOrganization?.id || null;

    console.log('Updating markers, selectedCategory:', selectedCategory, 'organizations:', organizations.length);
    
    // Store current map state before updating
    const currentZoom = map.getZoom();
    const currentCenter = map.getCenter();
    const shouldPreserveView = isJustOrgSelection || preventZoomRef.current;

    // Clear existing markers from cluster group
    organizationLayer.clearLayers();
    markersRef.current = [];

    // Reset offsets for consistent positioning
    resetLocationOffsets();

    // Check if mobile at the start of the effect
    const isMobile = window.innerWidth < 768;
    
    // Setup global function for popup details button
    if (typeof window !== 'undefined') {
      (window as any).showOrgDetails = (orgId: string) => {
        window.dispatchEvent(new CustomEvent('showOrgDetails', { detail: orgId }));
      };
    }

    // Track addresses to identify duplicates
    const addressCounts = new Map<string, number>();
    const crisisServiceOrgs: Organization[] = [];
    
    // Track exact GPS coordinates to handle stacked pins
    const coordinateCounts = new Map<string, number>();
    const coordinateOffsets = new Map<string, number>();
    
    organizations.forEach(org => {
      const count = addressCounts.get(org.address) || 0;
      addressCounts.set(org.address, count + 1);
      
      if (org.crisisService || org.category === 'Crisis Services') {
        crisisServiceOrgs.push(org);
      }
    });
    
    // Log addresses with multiple organizations
    addressCounts.forEach((count, address) => {
      if (count > 1) {
        console.log(`${count} organizations at address: ${address}`);
      }
    });
    
    // Debug Crisis Services specifically
    if (selectedCategory === 'Crisis Services' || crisisServiceOrgs.length > 0) {
      console.log('Crisis Services Debug:', {
        totalCrisisOrgs: crisisServiceOrgs.length,
        selectedCategory,
        uniqueAddresses: new Set(crisisServiceOrgs.map(o => o.address)).size,
        clusterRadius: 80
      });
    }
    
    // Add new markers
    organizations.forEach(org => {
      const isCrisisService = org.crisisService || org.category === 'Crisis Services';
      
      // Use real coordinates if available, otherwise fall back to geocoding
      let coords: { lat: number; lon: number } | null = null;
      if (org.latitude !== undefined && org.longitude !== undefined && !isNaN(org.latitude) && !isNaN(org.longitude)) {
        coords = { lat: org.latitude, lon: org.longitude };
        
        // Handle multiple organizations at exact same GPS coordinates
        const coordKey = `${org.latitude.toFixed(6)},${org.longitude.toFixed(6)}`;
        const coordCount = coordinateCounts.get(coordKey) || 0;
        coordinateCounts.set(coordKey, coordCount + 1);
        
        if (coordCount > 0) {
          // Apply offset for stacked pins at same GPS location
          const offsetIndex = coordinateOffsets.get(`${coordKey}:${org.id}`) || coordCount;
          coordinateOffsets.set(`${coordKey}:${org.id}`, offsetIndex);
          
          // Create a small circular offset pattern
          const angle = (offsetIndex - 1) * (2 * Math.PI / 8); // Max 8 pins in circle
          const offsetDistance = 0.0002 * Math.ceil(offsetIndex / 8); // Increase radius for outer rings
          
          coords.lat += offsetDistance * Math.cos(angle);
          coords.lon += offsetDistance * Math.sin(angle) * 1.2; // Adjust for longitude scaling
          
          console.log(`Applied offset to ${org.organizationName} at same GPS location (${offsetIndex} of ${coordCount + 1})`);
        }
      } else {
        coords = getCoordinatesFromAddress(org.address, isCrisisService);
        if (!coords) {
          console.warn(`No coordinates found for organization: ${org.organizationName} at ${org.address}`);
          return;
        }
      }
      
      
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
            z-index: 1;
            animation: none;
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

      const marker = L.marker([coords.lat, coords.lon], { icon });
      organizationLayer.addLayer(marker);
      markersRef.current.push(marker);
      
      // Store organization reference on marker for later use - create a closure to capture the correct org
      (function(organization) {
        (marker as any).organization = organization;
      
        // Add mousedown handler to prevent event bubbling
        marker.on('mousedown', (e: any) => {
          L.DomEvent.stopPropagation(e);
        });
        
        const encodedAddress = encodeURIComponent(organization.address);
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        
        // Create compact popup for mobile
        const popupContent = isMobile ? `
          <div style="max-width: 200px;">
            <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px; line-height: 1.2;">${organization.organizationName}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${organization.category}</p>
            <div style="margin-top: 8px; display: flex; gap: 4px;">
              ${organization.phone ? `<a href="tel:${organization.phone.replace(/\D/g, '')}" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 6px 8px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 500;">Call</a>` : ''}
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 6px 8px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 500;">Directions</a>
              <button onclick="window.showOrgDetails && window.showOrgDetails('${organization.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 6px 8px; background-color: #6b7280; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 500; border: none; cursor: pointer;">Details</button>
            </div>
          </div>
        ` : `
          <div style="max-width: 300px;">
            <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 16px;">${organization.organizationName}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${organization.category}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;">${organization.address}</p>
            ${organization.phone ? `<p style="margin: 0 0 4px 0; font-size: 14px;"><a href="tel:${organization.phone.replace(/\D/g, '')}" style="color: #2563eb; text-decoration: none; font-weight: 500;">📞 ${organization.phone}</a></p>` : ''}
            ${organization.hours ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #666;"><strong>Hours:</strong> ${organization.hours}</p>` : ''}
            ${organization.servicesOffered ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #666;"><strong>Services:</strong> ${organization.servicesOffered.substring(0, 100)}${organization.servicesOffered.length > 100 ? '...' : ''}</p>` : ''}
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              ${organization.phone ? `<a href="tel:${organization.phone.replace(/\D/g, '')}" style="flex: 1; display: inline-block; padding: 8px 12px; background-color: #16a34a; color: white; text-align: center; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">Call</a>` : ''}
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: inline-block; padding: 8px 12px; background-color: #2563eb; color: white; text-align: center; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">📍 Directions</a>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          autoPan: true,
          autoPanPaddingTopLeft: [50, 100],
          autoPanPaddingBottomRight: [50, 50],
          keepInView: true,
          maxWidth: isMobile ? 250 : 350
        });
        
        // Add tooltip that shows on hover (desktop only)
        if (!isMobile) {
          const tooltipContent = `
            <div style="
              padding: 8px 12px;
              background: rgba(0, 0, 0, 0.9);
              color: white;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              white-space: nowrap;
              max-width: 250px;
            ">
              <div style="font-weight: 600; margin-bottom: 2px;">
                ${organization.organizationName}
              </div>
              <div style="font-size: 12px; color: #e2e8f0;">
                ${organization.category}
                ${organization.crisisService ? '<span style="color: #ef4444; margin-left: 8px;">🚨 Crisis Service</span>' : ''}
              </div>
            </div>
          `;
          
          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -20],
            opacity: 1,
            className: 'custom-tooltip'
          });
        }
        
        marker.on('click', (e: any) => {
          // Prevent event bubbling that might trigger map click
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          
          // Debug logging to track organization object
          console.log('Map marker clicked:', {
            id: organization.id,
            name: organization.organizationName,
            category: organization.category,
            crisisService: organization.crisisService,
            hasClickHandler: !!onOrganizationClick
          });
          
          if (onOrganizationClick) {
            onOrganizationClick(organization);
          }
          
          // On mobile, ensure popup opens properly
          if (isMobile) {
            setTimeout(() => {
              marker.openPopup();
            }, 100);
          }
        });
      })(org);  // Pass org as parameter to the IIFE
    });

    // Create reset view function
    const resetViewFunction = () => {
      if (!map) return;
      
      if (selectedCategory && organizations.length > 0) {
        // Reset to show all resources in category
        const bounds = L.latLngBounds([]);
        let hasValidCoords = false;
        
        organizations.forEach(org => {
          // Use real coordinates if available, otherwise fall back to geocoding
          let coords: { lat: number; lon: number } | null = null;
          if (org.latitude !== undefined && org.longitude !== undefined && !isNaN(org.latitude) && !isNaN(org.longitude)) {
            coords = { lat: org.latitude, lon: org.longitude };
          } else {
            coords = getCoordinatesFromAddress(org.address);
          }
          
          if (coords) {
            const robesonCenter = [34.6400, -79.1100] as [number, number];
            const distance = Math.sqrt(
              Math.pow(coords.lat - robesonCenter[0], 2) + 
              Math.pow(coords.lon - robesonCenter[1], 2)
            );
            
            if (distance < 0.7) {
              bounds.extend([coords.lat, coords.lon]);
              hasValidCoords = true;
            }
          }
        });
        
        if (hasValidCoords && bounds.isValid()) {
          map.fitBounds(bounds, { 
            padding: isMobile ? [100, 100] : [200, 200], 
            maxZoom: isMobile ? 13 : 11,
            animate: true,
            duration: 0.5
          });
        }
      } else {
        // Reset to county view
        map.setView([34.6400, -79.1100], 9, {
          animate: true,
          duration: 0.5
        });
      }
    };
    
    // Store the reset function
    setOnResetView(() => resetViewFunction);

    // Handle zoom based on selected category
    const shouldSkipZoom = (!isMobile && isJustOrgSelection) || preventZoomRef.current;
    
    if (selectedCategory && organizations.length > 0 && !shouldSkipZoom) {
      console.log(`Zooming to category: ${selectedCategory}, organizations: ${organizations.length}`);
      
      // Always start by centering on Robeson County
      const robesonCenter = [34.6400, -79.1100] as [number, number];
      
      // Build bounds only from organizations within Robeson County area
      const bounds = L.latLngBounds([]);
      let hasValidCoords = false;
      let debugLocations: string[] = [];
      
      organizations.forEach(org => {
        // Use real coordinates if available, otherwise fall back to geocoding
        let coords: { lat: number; lon: number } | null = null;
        if (org.latitude !== undefined && org.longitude !== undefined && !isNaN(org.latitude) && !isNaN(org.longitude)) {
          coords = { lat: org.latitude, lon: org.longitude };
        } else {
          coords = getCoordinatesFromAddress(org.address);
        }
        
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
          map.setView(robesonCenter, isMobile ? 12 : 10, {
            animate: true,
            duration: 0.5
          });
        } else {
          // Small delay to ensure map is ready before zooming
          setTimeout(() => {
            // Zoom to show all filtered resources with better framing
            map.fitBounds(bounds, { 
              padding: isMobile ? [100, 100] : [200, 200], 
              maxZoom: isMobile ? 13 : 11,
              animate: true,
              duration: 0.5
            });
          }, 100);
        }
      } else {
        // If no valid coordinates or all filtered out, center on Robeson County
        console.log('No valid coordinates found, centering on Robeson County');
        map.setView(robesonCenter, isMobile ? 12 : 10, {
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
    
    // Restore view if we should preserve it
    if (shouldPreserveView && currentCenter && currentZoom) {
      setTimeout(() => {
        map.setView(currentCenter, currentZoom, {
          animate: false
        });
      }, 0);
    }
  }, [mapReady, L, organizations, selectedCategory, onOrganizationClick]);

  // Handle selected organization changes - update marker style
  useEffect(() => {
    if (!mapReady || !L || !mapRef.current) return;

    const map = mapRef.current;
    
    // Update all marker styles based on selection
    markersRef.current.forEach(marker => {
      const org = (marker as any).organization;
      if (!org) return;
      
      const isSelected = selectedOrganization?.id === org.id;
      const categoryIcon = CATEGORY_ICONS[org.category as keyof typeof CATEGORY_ICONS] || '📍';
      
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${isSelected ? '#3b82f6' : 'white'};
            border: ${isSelected ? '3px' : '2px'} solid ${isSelected ? '#1e40af' : '#1e293b'};
            border-radius: 50%;
            width: ${isSelected ? '40px' : '32px'};
            height: ${isSelected ? '40px' : '32px'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '22px' : '18px'};
            box-shadow: 0 ${isSelected ? '4px 8px' : '2px 4px'} rgba(0,0,0,${isSelected ? '0.4' : '0.3'});
            position: relative;
            z-index: ${isSelected ? '1000' : '1'};
            animation: ${isSelected ? 'pulse 2s infinite' : 'none'};
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
      
      marker.setIcon(icon);
    });
    
    // If there's a selected organization, pan to it and open popup
    if (selectedOrganization) {
      const selectedMarker = markersRef.current.find(marker => 
        (marker as any).organization?.id === selectedOrganization.id
      );
      
      if (selectedMarker) {
        // Don't pan if we're in the middle of cluster interaction
        if (!preventZoomRef.current) {
          // Use real coordinates if available, otherwise fall back to geocoding
          let coords: { lat: number; lon: number } | null = null;
          if (selectedOrganization.latitude !== undefined && selectedOrganization.longitude !== undefined && 
              !isNaN(selectedOrganization.latitude) && !isNaN(selectedOrganization.longitude)) {
            coords = { lat: selectedOrganization.latitude, lon: selectedOrganization.longitude };
          } else {
            coords = getCoordinatesFromAddress(selectedOrganization.address);
          }
          
          if (coords) {
            // Calculate offset to ensure popup is visible
            const isMobile = window.innerWidth < 768;
            const popupOffset = isMobile ? 0.002 : 0.001;
            
            map.panTo([coords.lat - popupOffset, coords.lon], {
              animate: true,
              duration: 0.5
            });
            
            // Open popup after pan completes
            setTimeout(() => {
              selectedMarker.openPopup();
            }, 600);
          }
        } else {
          // If preventing zoom, just open the popup
          selectedMarker.openPopup();
        }
      }
    }
  }, [mapReady, L, selectedOrganization]);

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-full w-full relative">
      <div id="map" className="h-full w-full" />
      
      {/* Reset View Button - moved to bottom right to avoid popup interference */}
      {isZoomedIn && onResetView && (
        <div className="absolute bottom-20 right-4 z-[1000]">
          <button
            onClick={onResetView}
            className="bg-white shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-300"
          >
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              {selectedCategory ? `Show All ${selectedCategory}` : 'Reset View'}
            </span>
          </button>
        </div>
      )}
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