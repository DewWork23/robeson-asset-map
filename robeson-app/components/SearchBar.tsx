import { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm, setSelectedCategory }: SearchBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');


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
  };

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Search resources"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

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