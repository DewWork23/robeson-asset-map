'use client';

import { useState, useRef, useEffect } from 'react';
import { geocodeAddress } from '@/lib/geocoding';

interface MapAddressSearchProps {
  onLocationSelect: (coords: { lat: number; lon: number; displayName: string }) => void;
}

export default function MapAddressSearch({ onLocationSelect }: MapAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await geocodeAddress(searchQuery);
      if (result) {
        onLocationSelect(result);
        setSearchQuery('');
        setIsExpanded(false);
      } else {
        setError('Address not found in Robeson County');
      }
    } catch (err) {
      setError('Error searching for address');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mobile view - compact search button that expands
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="absolute top-4 right-4 z-[400]">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
            aria-label="Search for an address"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-3 w-72">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search address in Robeson County..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSearching}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setSearchQuery('');
                  setError(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop view - always visible search bar
  return (
    <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-lg p-4" style={{ minWidth: '320px' }}>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for an address in Robeson County..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSearching}
          />
          <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Search for addresses, towns, or zip codes in Robeson County
      </p>
    </div>
  );
}