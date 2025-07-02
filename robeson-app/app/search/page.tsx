'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/organization';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { categoryToSlug } from '@/utils/categoryUtils';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organizations, loading } = useOrganizations();
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const fromVoice = searchParams.get('from') === 'voice';
    
    setSearchQuery(query);
    setIsVoiceSearch(fromVoice);

    if (query && organizations.length > 0) {
      // Search organizations by name, services, and description
      const normalizedQuery = query.toLowerCase().trim();
      const results = organizations.filter(org => {
        const searchableText = `${org.organizationName} ${org.servicesOffered || ''} ${org.description || ''}`.toLowerCase();
        return searchableText.includes(normalizedQuery);
      });

      // Sort results by relevance (name matches first)
      results.sort((a, b) => {
        const aNameMatch = a.organizationName.toLowerCase().includes(normalizedQuery);
        const bNameMatch = b.organizationName.toLowerCase().includes(normalizedQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return 0;
      });

      setSearchResults(results);
    }
  }, [searchParams, organizations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
            <div className="h-24 bg-gray-200 rounded-lg w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isVoiceSearch ? 'Voice Search Results' : 'Search Results'}
          </h1>
          <p className="text-lg text-gray-600">
            {searchResults.length > 0 
              ? `Found ${searchResults.length} result${searchResults.length > 1 ? 's' : ''} for "${searchQuery}"`
              : `No results found for "${searchQuery}"`
            }
          </p>
        </div>

        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {org.organizationName}
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">{CATEGORY_ICONS[org.category as keyof typeof CATEGORY_ICONS] || '📍'}</span>
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${CATEGORY_COLORS[org.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'}`}>
                        {org.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{org.address}</span>
                  </p>
                  {org.phone && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${org.phone.replace(/\D/g, '')}`} className="text-blue-600 hover:underline">
                        {org.phone}
                      </a>
                    </p>
                  )}
                  {org.servicesOffered && (
                    <p className="mt-2">
                      <strong>Services:</strong> {org.servicesOffered.substring(0, 150)}
                      {org.servicesOffered.length > 150 && '...'}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/category/${categoryToSlug(org.category)}?org=${org.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View on Map
                  </Link>
                  {org.phone && (
                    <a
                      href={`tel:${org.phone.replace(/\D/g, '')}`}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      Call Now
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any organizations matching "{searchQuery}". Try searching for a different term or browse by category.
            </p>
            <div className="space-y-3">
              <Link
                href="/categories"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse by Category
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Voice search tip */}
        {isVoiceSearch && searchResults.length === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Try saying the organization name more clearly, or search by the type of service you need 
              (like "food", "healthcare", or "housing").
            </p>
          </div>
        )}
      </div>
    </div>
  );
}