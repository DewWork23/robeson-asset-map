'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization, CATEGORY_ICONS, Category } from '@/types/organization';
import { loadOrganizationsFromGoogleSheets, filterOrganizations } from '@/lib/googleSheetsParser';
import OrganizationMap from '@/components/OrganizationMap';
import CategorySelectionPrompt from '@/components/CategorySelectionPrompt';
import { categoryToSlug } from '@/utils/categoryUtils';

export default function MapPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
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


  const handleCategorySelect = (category: Category | 'all') => {
    if (category === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    setShowPrompt(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 w-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (showPrompt) {
    return <CategorySelectionPrompt onCategorySelect={handleCategorySelect} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm z-10 flex-shrink-0">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              onClick={() => {
                setShowPrompt(true);
                setSelectedCategory(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base flex-shrink-0"
              aria-label="Go back to category selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Change Category</span>
              <span className="sm:hidden">Back</span>
            </button>
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 text-center px-2">
              {selectedCategory ? `${selectedCategory} Resources` : 'All Resources Map'}
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base flex-shrink-0"
              aria-label="Go to home page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-t pt-3">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by category:
            </label>
            
            <select
              id="category-filter"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full sm:w-auto px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Categories ({organizations.length} locations)</option>
              {Array.from(new Set(organizations.map(org => org.category))).sort().map((category) => {
                const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📍';
                const count = organizations.filter(org => org.category === category).length;
                return (
                  <option key={category} value={category}>
                    {icon} {category} ({count} locations)
                  </option>
                );
              })}
            </select>
            
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">
                {selectedCategory 
                  ? filterOrganizations(organizations, selectedCategory).length
                  : organizations.length
                }
              </span> of <span className="font-medium">{organizations.length}</span> locations
            </div>
          </div>
        </div>
      </div>

      {/* Map container - full screen without scrollbars */}
      <div className="flex-1 relative">
        <OrganizationMap 
          organizations={selectedCategory 
            ? filterOrganizations(organizations, selectedCategory)
            : organizations
          }
          allOrganizations={organizations}
          selectedCategory={selectedCategory}
          onCategorySelect={(cat) => {
            setSelectedCategory(cat);
          }}
          onOrganizationClick={(org) => {
            console.log('Organization clicked:', org);
          }}
        />
      </div>
    </div>
  );
}