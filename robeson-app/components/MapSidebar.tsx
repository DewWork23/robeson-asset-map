'use client';

import { useState, useEffect } from 'react';
import { Organization, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import { calculateDistance, getCoordinatesFromAddress } from '@/lib/locationUtils';
import { geocodeAddress } from '@/lib/geocoding';
import { filterOrganizations } from '@/lib/googleSheetsParser';
import CompactOrganizationCard from './CompactOrganizationCard';

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
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasPromptedForLocation, setHasPromptedForLocation] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  // Prompt for location on mount if not already prompted
  useEffect(() => {
    if (!hasPromptedForLocation && isOpen && !userLocation && !searchLocation) {
      setHasPromptedForLocation(true);
      // Small delay to let the sidebar render first
      setTimeout(() => {
        getCurrentLocation();
      }, 500);
    }
  }, [isOpen, hasPromptedForLocation, userLocation, searchLocation]);

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

  // Handle voice search
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setLocationError('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setLocationError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchAddress(transcript);
      setIsListening(false);
      // Automatically search after voice input
      setTimeout(() => {
        handleAddressSearch();
      }, 500);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setLocationError('No speech detected. Please try again.');
      } else {
        setLocationError('Voice search error. Please try typing instead.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Toggle button for mobile with descriptive text */}
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-20 lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-xl border border-blue-800 flex items-center gap-2 px-5 py-3.5 hover:shadow-2xl transition-all transform hover:scale-105"
        aria-label={isOpen ? 'Close resource list' : 'View resource list'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
        <span className="font-semibold">
          {isOpen ? 'Close' : 'View List'}
        </span>
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar/Bottom Sheet */}
      <div className={`
        fixed lg:relative bg-white border-gray-200 shadow-2xl lg:shadow-none
        transition-all duration-300 ease-in-out z-20 lg:z-10
        
        /* Mobile: Bottom sheet */
        bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto
        h-[75vh] lg:h-full
        rounded-t-3xl lg:rounded-none
        border-t lg:border-t-0 lg:border-r
        ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        
        /* Desktop: Side panel */
        lg:top-0 lg:translate-x-0
        w-full lg:w-96
      `}>
        <div className="h-full flex flex-col">
          {/* Mobile drag handle */}
          <div 
            className="lg:hidden flex justify-center py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onToggle}
          >
            <div className="w-16 h-1.5 bg-gray-400 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="p-4 pt-2 lg:pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Resources</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {selectedCategory ? (
                      <>Showing {organizations.length} of {allOrganizations.length} locations</>
                    ) : (
                      <>{organizations.length} locations</>
                    )}
                  </span>
                  {/* Mobile close button */}
                  <button
                    onClick={onToggle}
                    className="lg:hidden p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-sm"
                    aria-label="Close list"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filter toggle button */}
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters & Search
                  {(selectedCategory || sortBy === 'distance') && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      Active
                    </span>
                  )}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Collapsible filters section */}
            {filtersExpanded && (
              <div className="p-4 pt-3 space-y-3 border-t border-gray-100">
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
              <p className="text-xs text-gray-600">
                Find resources near you:
              </p>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                {isGettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Finding your location...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Current Location
                  </>
                )}
              </button>

              {locationError && (
                <p className="text-xs text-red-600">{locationError}</p>
              )}

              <div className="text-center text-xs text-gray-500 my-1">
                — OR —
              </div>

              {/* Address search */}
              <form onSubmit={(e) => { e.preventDefault(); handleAddressSearch(); }} className="space-y-1">
                <label htmlFor="address-search" className="text-xs text-gray-600">
                  Search by town or zip code:
                </label>
                <div className="relative">
                  <input
                    id="address-search"
                    type="text"
                    placeholder="e.g., Lumberton or 28358"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="w-full px-3 py-2 pr-20 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* Voice search button */}
                    <button
                      type="button"
                      onClick={startVoiceSearch}
                      disabled={isListening}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-100 text-red-600 animate-pulse' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-label={isListening ? "Listening..." : "Search by voice"}
                      title={isListening ? "Listening..." : "Search by voice"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    
                    {/* Search button */}
                    <button 
                      type="submit"
                      disabled={isSearching || !searchAddress.trim()}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      aria-label="Search location"
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {isListening && (
                  <p className="text-xs text-red-600 animate-pulse">
                    🎤 Listening... speak now
                  </p>
                )}
              </form>
            </div>

            {/* Sort options */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-600">
                  Sort list by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="distance" disabled={!userLocation && !searchLocation}>
                    {(!userLocation && !searchLocation) 
                      ? 'Distance (set location first)' 
                      : 'Distance (nearest first)'
                    }
                  </option>
                  <option value="category">Category</option>
                </select>
              </div>
              {sortBy === 'distance' && (
                <p className="text-xs mt-1">
                  {(userLocation || searchLocation) ? (
                    <span className="text-green-600">✓ Showing nearest resources first</span>
                  ) : (
                    <span className="text-amber-600">⚠️ Set location to sort by distance</span>
                  )}
                </p>
              )}
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
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
                  <CompactOrganizationCard
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