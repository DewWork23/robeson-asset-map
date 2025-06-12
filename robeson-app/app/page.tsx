'use client';

import { useState, useEffect } from 'react';
import { Organization, Category, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets, filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationCard from '@/components/OrganizationCard';
import SearchBar from '@/components/SearchBar';
import CrisisBanner from '@/components/CrisisBanner';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ManifestLink from '@/components/ManifestLink';
import OrganizationMap from '@/components/OrganizationMap';

export default function Home() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const orgs = await loadOrganizationsFromGoogleSheets();
      setOrganizations(orgs);
      setFilteredOrgs(orgs);
      setLoading(false);
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

  const crisisOrgs = organizations.filter(org => org.crisisService);
  const categories = Array.from(new Set(organizations.map(org => org.category))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceWorkerRegistration />
      <ManifestLink />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Robeson County Recovery Resources
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Find help in your community
          </p>
        </div>
      </header>

      {/* Crisis Banner - Only show in list view */}
      {viewMode === 'list' && <CrisisBanner organizations={crisisOrgs} />}

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          setUserLocation={setUserLocation}
        />
      </div>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading resources...</p>
          </div>
        ) : (
          <>
            {/* View Toggle and Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredOrgs.length} of {organizations.length} resources
              </div>
              <div className="flex gap-2">
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
                {!selectedCategory ? (
                  // Show category buttons
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Select a Category</h2>
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                      {categories.map((category) => {
                        const icon = CATEGORY_ICONS[category as Category] || '📍';
                        const count = organizations.filter(org => org.category === category).length;
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">{category}</p>
                                <p className="text-sm text-gray-500">{count} resources</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className="p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-blue-200 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🏢</span>
                          <div>
                            <p className="font-medium text-blue-900">All Resources</p>
                            <p className="text-sm text-blue-600">{organizations.length} total</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show filtered cards with back button
                  <>
                    <div className="mb-4">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        ← Back to categories
                      </button>
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
    </div>
  );
}