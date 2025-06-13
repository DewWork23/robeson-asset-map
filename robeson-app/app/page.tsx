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
    // Put Crisis Services category first
    if (a === 'Crisis Services' && b !== 'Crisis Services') return -1;
    if (a !== 'Crisis Services' && b === 'Crisis Services') return 1;
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
                Robeson County Community Resources
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

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
          <span className="text-lg">🚨</span>
          <p className="font-semibold">
            Life-threatening emergency? Call 911 immediately
          </p>
          <span className="hidden sm:inline">•</span>
          <p className="hidden sm:inline">
            Mental health crisis? Call or text 988
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-20">
        {loading ? (
          <div className="space-y-4">
            {/* Loading skeleton for categories */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1" />
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 flex justify-end">
                  <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                      <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Categories */}
            {!selectedCategory && viewMode === 'list' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1" />
                  <h2 className="text-lg font-semibold text-gray-900">Select a Category</h2>
                  <div className="flex-1 flex justify-end">
                    <div className="flex gap-2">
                      <button
                        onClick={handleNearMe}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
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
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105"
                        aria-pressed={true}
                      >
                        <span className="flex items-center gap-2">
                          <span>📋</span> List
                        </span>
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-400 hover:shadow-lg hover:scale-105"
                        aria-pressed={false}
                      >
                        <span className="flex items-center gap-2">
                          <span>🗺️</span> Map
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {categories.map((category) => {
                    const icon = CATEGORY_ICONS[category] || '📍';
                    const count = category === 'Crisis Services' 
                      ? organizations.filter(org => org.crisisService).length
                      : organizations.filter(org => org.category === category).length;
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`p-5 rounded-lg shadow-sm hover:shadow-2xl transition-all duration-200 transform hover:scale-110 border-2 text-left ${
                          category === 'Crisis Services' 
                            ? 'bg-red-100 border-red-300 hover:bg-red-200 hover:border-red-500 ring-1 ring-red-300 hover:ring-2' 
                            : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-500 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{icon}</span>
                          <div>
                            <p className={`font-semibold text-lg ${category === 'Crisis Services' ? 'text-red-900' : 'text-gray-900'}`}>
                              {category}
                            </p>
                            <p className={`text-base ${category === 'Crisis Services' ? 'text-red-700' : 'text-gray-600'}`}>
                              {count} resources
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="p-5 bg-blue-50 rounded-lg shadow-sm hover:shadow-2xl transition-all duration-200 transform hover:scale-110 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-500 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🏢</span>
                      <div>
                        <p className="font-semibold text-lg text-blue-900">All Resources</p>
                        <p className="text-base text-blue-600">{organizations.length} total</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}


            {/* Results Count and View Toggle */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCategory && selectedCategory !== 'All' ? (
                  `Showing ${filteredOrgs.length} ${selectedCategory} resources`
                ) : (
                  `Showing ${filteredOrgs.length} of ${organizations.length} resources`
                )}
              </div>
              {(selectedCategory || viewMode === 'map') && (
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
              )}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? (
              <>
                {selectedCategory && (
                  // Show filtered cards with back button
                  <>
                    <div className="mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                          aria-label="Go back to category selection"
                          autoFocus
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          <span>Back to All Categories</span>
                        </button>
                        <p className="mt-2 text-sm text-gray-600">Press Tab to navigate through resources</p>
                      </div>
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          {userLocation ? (
                            <>
                              <span className="font-medium">📍 Sorted by distance</span> - Showing {selectedCategory === 'All' ? 'all resources' : `${selectedCategory}`} nearest to your location first
                            </>
                          ) : (
                            <>
                              <span className="font-medium">🚨 Crisis services shown first</span> - {selectedCategory === 'All' ? 'All resources' : `${selectedCategory} resources`} are listed with emergency services at the top
                            </>
                          )}
                        </p>
                      </div>
                    </div>
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
                )}
              </>
            ) : (
              <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
                <OrganizationMap 
                  organizations={filteredOrgs}
                  allOrganizations={organizations}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
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
      
      {/* Footer with feedback link */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Found incorrect information or missing resources?
          </h3>
          <p className="text-gray-600 mb-4">
            Help us improve this guide by reporting errors, suggesting new resources, or sharing feedback.<br />
            Contact Jordan Dew, Social Research Specialist, UNCP SPARC
          </p>
          <a
            href="mailto:jordan.dew@uncp.edu?subject=Robeson County Community Resources - Feedback"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-xl hover:scale-110 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Feedback
          </a>
          <p className="text-sm text-gray-500 mt-3">
            <a href="mailto:jordan.dew@uncp.edu" className="text-blue-600 hover:underline">jordan.dew@uncp.edu</a>
          </p>
        </div>
      </footer>
      
      {/* Chat Bot */}
      <ChatBot 
        organizations={organizations} 
        viewMode={viewMode}
        onCategorySelect={setSelectedCategory}
        onViewModeChange={setViewMode}
      />
      
    </div>
  );
}