'use client';

import { useState, useEffect } from 'react';
import { Organization, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import { calculateDistance, getCoordinatesFromAddress } from '@/lib/locationUtils';
import { geocodeAddress } from '@/lib/geocoding';
import { filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationCard from './OrganizationCard';

interface MapSidebarProps {
  organizations: Organization[];
  allOrganizations: Organization[];
  selectedOrganization?: Organization | null;
  selectedCategory?: string | null;
  onOrganizationClick?: (org: Organization) => void;
  onCategoryChange?: (category: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type SortOption = 'distance' | 'name' | 'category';

export default function MapSidebar({ 
  organizations,
  allOrganizations,
  selectedOrganization,
  selectedCategory,
  onOrganizationClick,
  onCategoryChange,
  isOpen,
  onToggle
}: MapSidebarProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserLocation(location);
        setSearchLocation(location);
        setSortBy('distance');
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsGettingLocation(false);
      }
    );
  };

  // Sort organizations based on selected option
  const sortedOrganizations = [...organizations].sort((a, b) => {
    if (sortBy === 'distance' && (userLocation || searchLocation)) {
      const location = searchLocation || userLocation;
      if (!location) return 0;
      
      const distA = a.distance || Infinity;
      const distB = b.distance || Infinity;
      return distA - distB;
    } else if (sortBy === 'name') {
      return a.organizationName.localeCompare(b.organizationName);
    } else if (sortBy === 'category') {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.organizationName.localeCompare(b.organizationName);
    }
    return 0;
  });

  // Calculate distances when location changes
  useEffect(() => {
    const location = searchLocation || userLocation;
    if (location) {
      organizations.forEach(org => {
        const coords = org.address ? getCoordinatesFromAddress(org.address) : null;
        if (coords) {
          org.distance = calculateDistance(location.lat, location.lon, coords.lat, coords.lon);
        }
      });
    }
  }, [userLocation, searchLocation, organizations]);

  // Handle address search
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    setLocationError(null);
    
    try {
      const result = await geocodeAddress(searchAddress);
      if (result) {
        setSearchLocation({ lat: result.lat, lon: result.lon });
        setSortBy('distance');
      } else {
        setLocationError('Could not find that address');
      }
    } catch (error) {
      setLocationError('Error searching for address');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-20 lg:hidden bg-white rounded-full p-3 shadow-lg border border-gray-200"
        aria-label={isOpen ? 'Close list' : 'Open list'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          )}
        </svg>
      </button>

      {/* Sidebar/Bottom Sheet */}
      <div className={`
        fixed lg:relative bg-white border-gray-200 shadow-lg lg:shadow-none
        transition-all duration-300 ease-in-out z-10
        
        /* Mobile: Bottom sheet */
        bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto
        h-[70vh] lg:h-full
        rounded-t-2xl lg:rounded-none
        border-t-2 lg:border-t-0 lg:border-r
        ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        
        /* Desktop: Side panel */
        lg:top-0 lg:translate-x-0
        w-full lg:w-96
      `}>
        <div className="h-full flex flex-col">
          {/* Mobile drag handle */}
          <div className="lg:hidden flex justify-center py-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="p-4 pt-2 lg:pt-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Resources</h2>
              <span className="text-sm text-gray-500">
                {selectedCategory ? (
                  <>Showing {organizations.length} of {allOrganizations.length} locations</>
                ) : (
                  <>{organizations.length} locations</>
                )}
              </span>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
                Filter by category:
              </label>
              <select
                id="category-filter"
                value={selectedCategory || ''}
                onChange={(e) => onCategoryChange?.(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories ({allOrganizations.length} locations)</option>
                {Array.from(new Set(allOrganizations.map(org => org.category))).sort().map((category) => {
                  const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📍';
                  const count = filterOrganizations(allOrganizations, category).length;
                  return (
                    <option key={category} value={category}>
                      {icon} {category} ({count} locations)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Location controls */}
            <div className="space-y-2">
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                {isGettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Location
                  </>
                )}
              </button>

              {locationError && (
                <p className="text-xs text-red-600">{locationError}</p>
              )}

              {/* Address search */}
              <form onSubmit={(e) => { e.preventDefault(); handleAddressSearch(); }} className="relative">
                <input
                  type="text"
                  placeholder="Enter an address in Robeson County..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="submit"
                  disabled={isSearching || !searchAddress.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="distance" disabled={!userLocation && !searchLocation}>
                  Distance {(!userLocation && !searchLocation) && '(set location first)'}
                </option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {sortedOrganizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => onOrganizationClick?.(org)}
                  className={`cursor-pointer transition-all ${
                    selectedOrganization?.id === org.id 
                      ? 'ring-2 ring-blue-500 rounded-lg' 
                      : ''
                  }`}
                >
                  <OrganizationCard
                    organization={org}
                    showDistance={sortBy === 'distance' && (!!userLocation || !!searchLocation)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}