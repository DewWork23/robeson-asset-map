'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets, filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationCard from '@/components/OrganizationCard';
import SimpleSearchBar from '@/components/SimpleSearchBar';
import OrganizationMap from '@/components/OrganizationMap';
import { categoryToSlug } from '@/utils/categoryUtils';
import FeedbackBanner from '@/components/FeedbackBanner';

export default function NearMePage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('📍 Near me');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Get user location immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enable location services and refresh the page.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }

    // Load organizations
    async function loadData() {
      try {
        const orgs = await loadOrganizationsFromGoogleSheets();
        setOrganizations(orgs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading organizations:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (organizations.length === 0 || !userLocation) return;

    const filtered = filterOrganizations(
      organizations,
      'All',
      searchTerm === '📍 Near me' ? '' : searchTerm,
      userLocation || undefined
    );
    setFilteredOrgs(filtered);
  }, [organizations, searchTerm, userLocation]);

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
            <span className="text-4xl">📍</span>
            Resources Near Me
          </h1>
          {userLocation && !locationError && (
            <p className="text-gray-600 mt-2">
              Showing {filteredOrgs.length} resources sorted by distance from your location
            </p>
          )}
        </div>

        {/* Error message */}
        {locationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{locationError}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SimpleSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search resources near you..."
          />
        </div>

        {/* View Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {userLocation && (
              <>
                <span className="font-medium">📍 Sorted by distance</span> - Closest resources first
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
        {userLocation && !locationError ? (
          viewMode === 'list' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrgs.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          ) : (
            <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
              <OrganizationMap 
                organizations={filteredOrgs}
                allOrganizations={organizations}
                selectedCategory="All"
                onCategorySelect={(cat) => {
                  router.push(cat === null ? '/' : `/category/${categoryToSlug(cat)}`);
                }}
                onOrganizationClick={(org) => {
                  console.log('Organization clicked:', org);
                }}
              />
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Waiting for location access...</p>
          </div>
        )}

        {filteredOrgs.length === 0 && userLocation && (
          <div className="text-center py-12">
            <p className="text-gray-600">No resources found near your location.</p>
          </div>
        )}
      </div>
      <FeedbackBanner />
    </main>
  );
}