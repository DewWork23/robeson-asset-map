'use client';

import { useState, useEffect } from 'react';
import { Organization, Category, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets, filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationCard from '@/components/OrganizationCard';
import SearchBar from '@/components/SearchBar';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ManifestLink from '@/components/ManifestLink';
import OrganizationMap from '@/components/OrganizationMap';
import ChatBot from '@/components/ChatBot';
import CategoryTabs from '@/components/CategoryTabs';

export default function Home() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setSearchTerm('📍 Near me');
          setSelectedCategory('All');
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

  useEffect(() => {
    async function loadData() {
      try {
        // Start loading
        const startTime = Date.now();
        
        const orgs = await loadOrganizationsFromGoogleSheets();
        
        // Ensure minimum loading time for smooth transition
        const loadTime = Date.now() - startTime;
        const minLoadTime = 300; // 300ms minimum
        
        if (loadTime < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - loadTime));
        }
        
        setOrganizations(orgs);
        setFilteredOrgs(orgs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load organizations:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const filtered = filterOrganizations(
      organizations, 
      selectedCategory || 'All', 
      searchTerm, 
      userLocation || undefined
    );
    setFilteredOrgs(filtered);
  }, [organizations, selectedCategory, searchTerm, userLocation]);

  const categories = Array.from(new Set(organizations.map(org => org.category))).sort((a, b) => {
    // Put Crisis Services first
    if (a === 'Crisis Services') return -1;
    if (b === 'Crisis Services') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceWorkerRegistration />
      <ManifestLink />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-50 to-green-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">
                Robeson County Recovery Resources
              </h1>
              <p className="text-base text-gray-700 mt-2 font-medium">
                You're not alone • Help is here • Your journey starts today
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <SearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          </div>
        </div>
      </header>


      {/* Category Tabs - Always visible */}
      <CategoryTabs 
        organizations={organizations}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-20 pt-4">
        {loading ? (
          <div className="space-y-4">
            {/* Loading skeleton */}
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading resources...</p>
              </div>
            </div>
          </div>
        ) : (
          <>


            {/* Results Count and View Toggle */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCategory && selectedCategory !== 'All' ? (
                  `Showing ${filteredOrgs.length} ${selectedCategory} resources`
                ) : (
                  `Showing ${filteredOrgs.length} of ${organizations.length} resources`
                )}
              </div>
              <div className="flex gap-2">
                  <button
                    onClick={handleNearMe}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    aria-label="Find resources near me"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Near Me</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    aria-pressed={viewMode === 'list'}
                  >
                    <span className="flex items-center gap-2">
                      <span>📋</span> List
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === 'map'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    aria-pressed={viewMode === 'map'}
                  >
                    <span className="flex items-center gap-2">
                      <span>🗺️</span> Map
                    </span>
                  </button>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? (
              <>
                {/* Sorting info */}
                {userLocation && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">📍 Sorted by distance</span> - Showing {!selectedCategory || selectedCategory === 'All' ? 'all resources' : `${selectedCategory}`} nearest to your location first
                    </p>
                  </div>
                )}
                
                {/* Resource Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredOrgs.map((org) => (
                    <OrganizationCard key={org.id} organization={org} />
                  ))}
                </div>
                {filteredOrgs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No resources found matching your criteria.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
                <OrganizationMap 
                  organizations={filteredOrgs}
                  onOrganizationClick={(org) => {
                    // Scroll to organization card or show details
                    console.log('Organization clicked:', org);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Chat Bot */}
      <ChatBot organizations={organizations} />
    </div>
  );
}