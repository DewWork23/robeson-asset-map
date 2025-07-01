'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Organization, CATEGORY_ICONS } from '@/types/organization';
import { filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationCard from '@/components/OrganizationCard';
import SimpleSearchBar from '@/components/SimpleSearchBar';
import OrganizationMap from '@/components/OrganizationMap';
import { slugToCategory, categoryToSlug } from '@/utils/categoryUtils';
import FeedbackBanner from '@/components/FeedbackBanner';
import { useOrganizations } from '@/contexts/OrganizationsContext';

function CategoryPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const category = slugToCategory(slug);

  // Use cached organizations data
  const { organizations, loading } = useOrganizations();
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  // Default to map view if coming from voice search, otherwise list
  const fromVoice = searchParams.get('from') === 'voice';
  const [viewMode, setViewMode] = useState<'list' | 'map'>(fromVoice ? 'map' : 'list');
  const [mapSelectedCategory, setMapSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      router.push('/');
      return;
    }
  }, [category, router]);

  useEffect(() => {
    if (!category || organizations.length === 0) return;

    const filtered = filterOrganizations(
      organizations,
      category,
      searchTerm,
      userLocation || undefined
    );
    setFilteredOrgs(filtered);
  }, [organizations, category, searchTerm, userLocation]);

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setSearchTerm('📍 Near me');
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!category) {
    return null; // Will redirect
  }

  const icon = CATEGORY_ICONS[category] || '📍';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
            aria-label="Go back to all categories"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to All Categories</span>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            {category}
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredOrgs.length} resources available
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SimpleSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNearMe={handleNearMe}
            placeholder={`Search ${category}...`}
          />
        </div>

        {/* View Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {userLocation ? (
              <>
                <span className="font-medium">📍 Sorted by distance</span> - Showing {category} nearest to your location first
              </>
            ) : (
              <>
                {category === 'Crisis Services' && <span className="font-medium">🚨 Crisis services sorted by priority</span>}
                {category !== 'Crisis Services' && <span className="font-medium">Showing {category} resources</span>}
              </>
            )}
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

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        ) : (
          <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
            <OrganizationMap 
              organizations={mapSelectedCategory === null || mapSelectedCategory === category
                ? filteredOrgs
                : filterOrganizations(organizations, mapSelectedCategory)
              }
              allOrganizations={organizations}
              selectedCategory={mapSelectedCategory || category}
              onCategorySelect={(newCat) => {
                setMapSelectedCategory(newCat);
              }}
              onOrganizationClick={(org) => {
                console.log('Organization clicked:', org);
              }}
            />
          </div>
        )}

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No resources found matching your criteria.</p>
          </div>
        )}
      </div>
      <FeedbackBanner />
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}