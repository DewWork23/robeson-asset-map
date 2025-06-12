'use client';

import { useState, useEffect } from 'react';
import { Organization, Category, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets, filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationCard from '@/components/OrganizationCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import CrisisBanner from '@/components/CrisisBanner';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ManifestLink from '@/components/ManifestLink';
import OrganizationMap from '@/components/OrganizationMap';

export default function Home() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
    const filtered = filterOrganizations(organizations, selectedCategory, searchTerm, userLocation || undefined);
    setFilteredOrgs(filtered);
  }, [organizations, selectedCategory, searchTerm, userLocation]);

  const categories = ['All', ...Array.from(new Set(organizations.map(org => org.category)))];
  const crisisOrgs = organizations.filter(org => org.crisisService);

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

      {/* Crisis Banner */}
      <CrisisBanner organizations={crisisOrgs} />

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          setUserLocation={setUserLocation}
        />
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
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
              <div className="h-[400px] bg-white rounded-lg shadow-sm overflow-hidden">
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