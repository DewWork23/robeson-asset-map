import { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setUserLocation: (location: { lat: number; lon: number } | null) => void;
  setSelectedCategory: (category: string | null) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm, setUserLocation, setSelectedCategory }: SearchBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setSearchTerm('📍 Near me');
          setSelectedCategory('All'); // Show all categories when using location
          setIsSearchOpen(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      setSearchTerm(localSearchTerm);
      setSelectedCategory('All'); // Show all categories when searching
      setIsSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setLocalSearchTerm('');
    setUserLocation(null);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
          aria-label="Search resources"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Resources
          {searchTerm && <span className="text-blue-600">({searchTerm})</span>}
        </button>
        
        <button
          onClick={handleNearMe}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          aria-label="Find resources near me"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="ml-2 hidden sm:inline">Near Me</span>
        </button>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Search Resources</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, service, or location..."
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    clearSearch();
                    setIsSearchOpen(false);
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}